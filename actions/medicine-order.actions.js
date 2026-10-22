'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  sendMedicineOrderConfirmation,
  sendMedicineOrderStatusUpdate,
} from '@/lib/resend';

// Helper for Admin Authorization
async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized. Administrator privileges required.');
  }
  return session;
}

// Helper for Authenticated Customer
async function requireAuth() {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized. Please sign in to continue.');
  }
  return session;
}

// Zod Schema for Checkout Order Creation
const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  customerEmail: z.string().trim().email('Invalid email address'),
  customerPhone: z.string().trim().min(7, 'Valid phone number required').max(20),
  deliveryAddress: z.string().trim().min(5, 'Delivery address is required').max(250),
  city: z.string().trim().min(2, 'City is required').max(50),
  postalCode: z.string().trim().max(20).optional().default(''),
  orderNotes: z.string().trim().max(500).optional().default(''),
  deliveryMethod: z.enum(['standard', 'express']).default('standard'),
  paymentMethod: z.enum(['CASH', 'STRIPE', 'JAZZCASH', 'EASYPAISA']).default('CASH'),
  prescriptionUrl: z.string().trim().optional().nullable(),
  prescriptionNotes: z.string().trim().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        id: z.string().min(1, 'Medicine ID required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'Cart cannot be empty'),
});

/**
 * Atomic Order Creation with Concurrency Control & Stock Revalidation
 */
export async function createMedicineOrder(payload) {
  try {
    const session = await auth();
    const parsed = createOrderSchema.safeParse(payload);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid order data';
      return { success: false, error: firstError };
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      city,
      postalCode,
      orderNotes,
      deliveryMethod,
      paymentMethod,
      prescriptionUrl,
      prescriptionNotes,
      items: requestItems,
    } = parsed.data;

    const itemIds = requestItems.map((it) => it.id);

    // MongoDB Multi-Document ACID Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current live medicine records from database
      const liveMedicines = await tx.medicineProduct.findMany({
        where: { id: { in: itemIds }, isActive: true, status: 'ACTIVE' },
        include: {
          batches: {
            where: { quantity: { gt: 0 } },
            orderBy: { expiryDate: 'asc' }, // FEFO: First Expired First Out
          },
        },
      });

      if (liveMedicines.length !== requestItems.length) {
        throw new Error('One or more selected medicines are no longer available in the active catalog.');
      }

      const medicinesMap = new Map(liveMedicines.map((m) => [m.id, m]));

      let subtotal = 0;
      let originalTotal = 0;
      let hasPrescriptionItem = false;
      const orderItemsData = [];

      // 2. Validate stock and allocate batches
      for (const reqItem of requestItems) {
        const medicine = medicinesMap.get(reqItem.id);
        if (!medicine) {
          throw new Error(`Medicine not found: ${reqItem.id}`);
        }

        // Strict Stock Check
        if (medicine.stock < reqItem.quantity) {
          throw new Error(
            `Insufficient stock for "${medicine.name}". Requested ${reqItem.quantity}, but only ${medicine.stock} units are currently available.`
          );
        }

        if (medicine.prescriptionRequired) {
          hasPrescriptionItem = true;
        }

        // Price calculation: server side only!
        const unitPrice = medicine.price;
        const discountPrice =
          medicine.discountPrice && medicine.discountPrice < medicine.price
            ? medicine.discountPrice
            : null;
        const effectivePrice = discountPrice || unitPrice;
        const lineTotal = effectivePrice * reqItem.quantity;

        subtotal += lineTotal;
        originalTotal += unitPrice * reqItem.quantity;

        // Atomic stock decrement
        await tx.medicineProduct.update({
          where: { id: medicine.id },
          data: { stock: { decrement: reqItem.quantity } },
        });

        // Batch allocation (FEFO)
        let remainingQtyToAllocate = reqItem.quantity;
        let allocatedBatchNumber = null;

        for (const batch of medicine.batches) {
          if (remainingQtyToAllocate <= 0) break;
          const deduct = Math.min(batch.quantity, remainingQtyToAllocate);
          if (deduct > 0) {
            await tx.medicineBatch.update({
              where: { id: batch.id },
              data: { quantity: { decrement: deduct } },
            });
            remainingQtyToAllocate -= deduct;
            if (!allocatedBatchNumber) {
              allocatedBatchNumber = batch.batchNumber;
            }
          }
        }

        orderItemsData.push({
          medicineId: medicine.id,
          name: medicine.name,
          genericName: medicine.genericName,
          sku: medicine.sku,
          dosageForm: medicine.dosageForm,
          strength: medicine.strength,
          unitPrice,
          discountPrice,
          quantity: reqItem.quantity,
          subtotal: lineTotal,
          prescriptionReq: medicine.prescriptionRequired,
          batchNumber: allocatedBatchNumber,
        });
      }

      // If prescription items present, prescription must be provided
      if (hasPrescriptionItem && !prescriptionUrl) {
        throw new Error(
          'Your order contains prescription medicines. Please upload or attach a valid doctor prescription.'
        );
      }

      // Delivery Fee Calculation
      const deliveryFee = deliveryMethod === 'express' ? 300 : subtotal >= 2000 ? 0 : 150;
      const discountTotal = Math.max(0, originalTotal - subtotal);
      const finalTotal = subtotal + deliveryFee;

      // Status assignment
      const prescriptionStatus = hasPrescriptionItem
        ? 'PENDING_REVIEW'
        : 'NOT_REQUIRED';
      const orderStatus = hasPrescriptionItem
        ? 'PRESCRIPTION_REVIEW'
        : 'CONFIRMED';

      const orderNumber = `MED-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const initialHistory = [
        {
          status: orderStatus,
          timestamp: new Date().toISOString(),
          note: hasPrescriptionItem
            ? 'Order placed with prescription awaiting verification.'
            : 'Order placed and confirmed automatically.',
          changedBy: session?.user?.name || customerName,
        },
      ];

      // 3. Create Order & Items
      const createdOrder = await tx.medicineOrder.create({
        data: {
          orderNumber,
          userId: session?.user?.id || null,
          customerName,
          customerEmail,
          customerPhone,
          deliveryAddress,
          city,
          postalCode,
          orderNotes,
          deliveryMethod,
          paymentMethod,
          paymentStatus: 'PENDING',
          orderStatus,
          prescriptionStatus,
          prescriptionUrl: prescriptionUrl || null,
          prescriptionNotes: prescriptionNotes || null,
          subtotal,
          discountTotal,
          deliveryFee,
          finalTotal,
          statusHistory: initialHistory,
          confirmedAt: hasPrescriptionItem ? null : new Date(),
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 4. In-App Notification if user is registered
      if (session?.user?.id) {
        await tx.notification.create({
          data: {
            userId: session.user.id,
            type: 'ORDER_PLACED',
            title: `Order Placed: #${orderNumber}`,
            message: hasPrescriptionItem
              ? `Your medicine order #${orderNumber} for PKR ${finalTotal.toLocaleString()} is pending prescription verification.`
              : `Your medicine order #${orderNumber} for PKR ${finalTotal.toLocaleString()} has been placed successfully.`,
            link: `/my-medicine-orders/${createdOrder.id}`,
            metadata: { orderId: createdOrder.id, orderNumber },
          },
        });
      }

      return createdOrder;
    });

    // 5. Send Email Confirmation in background (Resend)
    sendMedicineOrderConfirmation({
      to: customerEmail,
      customerName,
      orderNumber: result.orderNumber,
      items: result.items,
      total: result.finalTotal,
      orderStatus: result.orderStatus,
      prescriptionRequired: result.prescriptionStatus !== 'NOT_REQUIRED',
    }).catch((err) => console.error('Order email confirmation error:', err));

    revalidatePath('/admin/medicine-orders');
    revalidatePath('/my-medicine-orders');

    return {
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
      orderStatus: result.orderStatus,
    };
  } catch (error) {
    console.error('Create medicine order error:', error);
    return { success: false, error: error.message || 'Failed to place order.' };
  }
}

/**
 * Customer Orders List
 */
export async function getCustomerMedicineOrders() {
  try {
    const session = await requireAuth();

    const orders = await prisma.medicineOrder.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return { success: true, orders };
  } catch (error) {
    console.error('getCustomerMedicineOrders error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Customer Single Order Detail
 */
export async function getCustomerMedicineOrder(orderId) {
  try {
    const session = await requireAuth();

    const order = await prisma.medicineOrder.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                dosageForm: true,
                strength: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found or unauthorized.' };
    }

    return { success: true, order };
  } catch (error) {
    console.error('getCustomerMedicineOrder error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Customer Order Cancellation (Restores Stock Atomically)
 */
export async function cancelCustomerMedicineOrder(orderId, reason = 'Cancelled by customer') {
  try {
    const session = await requireAuth();

    const order = await prisma.medicineOrder.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    // Only allow cancellation in early states before dispatch
    const cancellableStates = [
      'PENDING',
      'AWAITING_PRESCRIPTION',
      'PRESCRIPTION_REVIEW',
      'CONFIRMED',
    ];
    if (!cancellableStates.includes(order.orderStatus)) {
      return {
        success: false,
        error: `Order cannot be cancelled in "${order.orderStatus}" state because fulfillment has already begun.`,
      };
    }

    // Transaction to restore stock and cancel
    await prisma.$transaction(async (tx) => {
      // 1. Restore stock for each item
      for (const item of order.items) {
        await tx.medicineProduct.update({
          where: { id: item.medicineId },
          data: { stock: { increment: item.quantity } },
        });

        if (item.batchNumber) {
          await tx.medicineBatch
            .updateMany({
              where: {
                medicineId: item.medicineId,
                batchNumber: item.batchNumber,
              },
              data: { quantity: { increment: item.quantity } },
            })
            .catch(() => {});
        }
      }

      // 2. Update status and history
      const newHistory = [
        ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
        {
          status: 'CANCELLED',
          timestamp: new Date().toISOString(),
          note: `Cancelled by customer. Reason: ${reason}`,
          changedBy: session.user.name || 'Customer',
        },
      ];

      await tx.medicineOrder.update({
        where: { id: order.id },
        data: {
          orderStatus: 'CANCELLED',
          cancellationReason: reason,
          cancelledAt: new Date(),
          statusHistory: newHistory,
        },
      });

      // 3. Notification
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'ORDER_STATUS_CHANGED',
          title: `Order Cancelled: #${order.orderNumber}`,
          message: `Your medicine order #${order.orderNumber} has been cancelled successfully.`,
          link: `/my-medicine-orders/${order.id}`,
        },
      });
    });

    sendMedicineOrderStatusUpdate({
      to: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      newStatus: 'CANCELLED',
      trackingNote: `Order was cancelled upon request. Reason: ${reason}`,
    }).catch(() => {});

    revalidatePath('/my-medicine-orders');
    revalidatePath('/admin/medicine-orders');

    return { success: true };
  } catch (error) {
    console.error('cancelCustomerMedicineOrder error:', error);
    return { success: false, error: error.message || 'Failed to cancel order.' };
  }
}

/**
 * Admin: Get Orders List with Multi-filters, Search & Pagination
 */
export async function getAdminMedicineOrders(filters = {}) {
  try {
    await requireAdmin();

    const {
      q = '',
      status = 'all',
      paymentStatus = 'all',
      prescriptionStatus = 'all',
      page = 1,
      limit = 15,
    } = filters;

    const where = {};

    if (q) {
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      where.orderStatus = status;
    }

    if (paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus;
    }

    if (prescriptionStatus !== 'all') {
      where.prescriptionStatus = prescriptionStatus;
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.medicineOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: true,
        },
      }),
      prisma.medicineOrder.count({ where }),
    ]);

    return { success: true, orders, total, pageCount: Math.ceil(total / limit) };
  } catch (error) {
    console.error('getAdminMedicineOrders error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Single Order Details
 */
export async function getAdminMedicineOrder(orderId) {
  try {
    await requireAdmin();

    const order = await prisma.medicineOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    return { success: true, order };
  } catch (error) {
    console.error('getAdminMedicineOrder error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Status Machine Transition Enforcer
 */
export async function updateMedicineOrderStatus({
  orderId,
  nextStatus,
  note = '',
  paymentStatus,
}) {
  try {
    const session = await requireAdmin();

    const order = await prisma.medicineOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return { success: false, error: 'Order not found.' };

    const current = order.orderStatus;

    // Strict State Transition Validation
    const validTransitions = {
      PENDING: ['CONFIRMED', 'AWAITING_PRESCRIPTION', 'PRESCRIPTION_REVIEW', 'CANCELLED', 'REJECTED'],
      AWAITING_PRESCRIPTION: ['PRESCRIPTION_REVIEW', 'CANCELLED', 'REJECTED'],
      PRESCRIPTION_REVIEW: ['CONFIRMED', 'CANCELLED', 'REJECTED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['READY_FOR_DISPATCH', 'CANCELLED'],
      READY_FOR_DISPATCH: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REJECTED: [],
      REFUNDED: [],
    };

    if (current !== nextStatus && !validTransitions[current]?.includes(nextStatus)) {
      return {
        success: false,
        error: `Invalid status transition: Cannot move from "${current}" to "${nextStatus}".`,
      };
    }

    await prisma.$transaction(async (tx) => {
      // If moving to CANCELLED or REJECTED from an active state, restore inventory!
      const isCancellation = (nextStatus === 'CANCELLED' || nextStatus === 'REJECTED') &&
        current !== 'CANCELLED' && current !== 'REJECTED';

      if (isCancellation) {
        for (const item of order.items) {
          await tx.medicineProduct.update({
            where: { id: item.medicineId },
            data: { stock: { increment: item.quantity } },
          });

          if (item.batchNumber) {
            await tx.medicineBatch
              .updateMany({
                where: {
                  medicineId: item.medicineId,
                  batchNumber: item.batchNumber,
                },
                data: { quantity: { increment: item.quantity } },
              })
              .catch(() => {});
          }
        }
      }

      const updateData = {
        orderStatus: nextStatus,
        statusHistory: [
          ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
          {
            status: nextStatus,
            timestamp: new Date().toISOString(),
            note: note || `Status changed to ${nextStatus}`,
            changedBy: session.user.name || 'Administrator',
          },
        ],
      };

      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      if (nextStatus === 'CONFIRMED' && !order.confirmedAt) {
        updateData.confirmedAt = new Date();
      } else if (nextStatus === 'SHIPPED' && !order.dispatchedAt) {
        updateData.dispatchedAt = new Date();
      } else if (nextStatus === 'DELIVERED') {
        updateData.deliveredAt = new Date();
        // If COD, mark paid upon confirmed delivery
        if (order.paymentMethod === 'CASH') {
          updateData.paymentStatus = 'PAID';
        }
      } else if (nextStatus === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = note;
      }

      await tx.medicineOrder.update({
        where: { id: orderId },
        data: updateData,
      });

      // Notification
      if (order.userId) {
        await tx.notification.create({
          data: {
            userId: order.userId,
            type: 'ORDER_STATUS_CHANGED',
            title: `Order Update: #${order.orderNumber} is ${nextStatus}`,
            message: `Your medicine order status has been updated to: ${nextStatus}. ${note ? `Note: ${note}` : ''}`,
            link: `/my-medicine-orders/${order.id}`,
          },
        });
      }
    });

    sendMedicineOrderStatusUpdate({
      to: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      newStatus: nextStatus,
      trackingNote: note,
    }).catch(() => {});

    revalidatePath('/admin/medicine-orders');
    revalidatePath(`/admin/medicine-orders/${orderId}`);
    revalidatePath('/my-medicine-orders');

    return { success: true };
  } catch (error) {
    console.error('updateMedicineOrderStatus error:', error);
    return { success: false, error: error.message || 'Status update failed.' };
  }
}

/**
 * Admin: Prescription Verification Review Action
 */
export async function reviewPrescriptionVerification({
  orderId,
  decision, // 'APPROVE' or 'REJECT'
  rejectionReason = '',
}) {
  try {
    const session = await requireAdmin();

    const order = await prisma.medicineOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return { success: false, error: 'Order not found.' };

    if (decision === 'APPROVE') {
      await prisma.$transaction(async (tx) => {
        const newHistory = [
          ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
          {
            status: 'CONFIRMED',
            timestamp: new Date().toISOString(),
            note: 'Prescription verified and approved by pharmacy staff.',
            changedBy: session.user.name || 'Pharmacist',
          },
        ];

        await tx.medicineOrder.update({
          where: { id: orderId },
          data: {
            prescriptionStatus: 'APPROVED',
            orderStatus: 'CONFIRMED',
            prescriptionReviewedBy: session.user.id,
            prescriptionReviewedAt: new Date(),
            confirmedAt: new Date(),
            statusHistory: newHistory,
          },
        });

        if (order.userId) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              type: 'PRESCRIPTION_STATUS',
              title: `Prescription Approved: Order #${order.orderNumber}`,
              message: `Your prescription has been verified. Your medicine order is now confirmed for fulfillment.`,
              link: `/my-medicine-orders/${order.id}`,
            },
          });
        }
      });
    } else {
      // REJECT: Restore inventory and set rejection
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.medicineProduct.update({
            where: { id: item.medicineId },
            data: { stock: { increment: item.quantity } },
          });
        }

        const newHistory = [
          ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
          {
            status: 'REJECTED',
            timestamp: new Date().toISOString(),
            note: `Prescription verification rejected. Reason: ${rejectionReason}`,
            changedBy: session.user.name || 'Pharmacist',
          },
        ];

        await tx.medicineOrder.update({
          where: { id: orderId },
          data: {
            prescriptionStatus: 'REJECTED',
            orderStatus: 'REJECTED',
            rejectionReason,
            prescriptionReviewedBy: session.user.id,
            prescriptionReviewedAt: new Date(),
            statusHistory: newHistory,
          },
        });

        if (order.userId) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              type: 'PRESCRIPTION_STATUS',
              title: `Prescription Verification Issue: Order #${order.orderNumber}`,
              message: `Prescription verification could not be approved. Reason: ${rejectionReason}`,
              link: `/my-medicine-orders/${order.id}`,
            },
          });
        }
      });
    }

    revalidatePath('/admin/medicine-orders');
    revalidatePath(`/admin/medicine-orders/${orderId}`);
    revalidatePath('/my-medicine-orders');

    return { success: true };
  } catch (error) {
    console.error('reviewPrescriptionVerification error:', error);
    return { success: false, error: error.message || 'Prescription review failed.' };
  }
}

/**
 * Admin: Real-time Analytics & Dashboard Metrics
 */
export async function getAdminMedicineOrderStats() {
  try {
    await requireAdmin();

    const [
      totalOrders,
      pendingOrders,
      awaitingPrescription,
      confirmedOrders,
      processingOrders,
      dispatchedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
    ] = await Promise.all([
      prisma.medicineOrder.count(),
      prisma.medicineOrder.count({ where: { orderStatus: 'PENDING' } }),
      prisma.medicineOrder.count({
        where: {
          OR: [
            { orderStatus: 'AWAITING_PRESCRIPTION' },
            { orderStatus: 'PRESCRIPTION_REVIEW' },
            { prescriptionStatus: 'PENDING_REVIEW' },
          ],
        },
      }),
      prisma.medicineOrder.count({ where: { orderStatus: 'CONFIRMED' } }),
      prisma.medicineOrder.count({ where: { orderStatus: 'PROCESSING' } }),
      prisma.medicineOrder.count({
        where: {
          OR: [{ orderStatus: 'SHIPPED' }, { orderStatus: 'OUT_FOR_DELIVERY' }],
        },
      }),
      prisma.medicineOrder.count({ where: { orderStatus: 'DELIVERED' } }),
      prisma.medicineOrder.count({
        where: { OR: [{ orderStatus: 'CANCELLED' }, { orderStatus: 'REJECTED' }] },
      }),
      prisma.medicineOrder.aggregate({
        _sum: { finalTotal: true },
        where: {
          orderStatus: { notIn: ['CANCELLED', 'REJECTED'] },
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        awaitingPrescription,
        confirmedOrders,
        processingOrders,
        dispatchedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: revenueResult._sum.finalTotal || 0,
      },
    };
  } catch (error) {
    console.error('getAdminMedicineOrderStats error:', error);
    return { success: false, error: error.message };
  }
}
