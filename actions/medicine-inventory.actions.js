'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized. Administrator privileges required.');
  }
  return session;
}

const medicineInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, 'Name is required').max(120),
  genericName: z.string().trim().max(120).optional().nullable(),
  brand: z.string().trim().max(120).optional().nullable(),
  category: z.string().trim().min(2, 'Category is required'),
  subcategory: z.string().trim().max(100).optional().nullable(),
  activeIngredients: z.array(z.string()).optional().default([]),
  indications: z.string().trim().max(1000).optional().nullable(),
  description: z.string().trim().min(5, 'Description is required').max(2000),
  strength: z.string().trim().max(60).optional().nullable(),
  dosageForm: z.string().trim().max(60).optional().nullable(),
  packageSize: z.string().trim().max(100).optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  price: z.number().min(0, 'Price must be positive'),
  discountPrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().trim().max(50).optional().nullable(),
  prescriptionRequired: z.boolean().default(false),
  storageInstructions: z.string().trim().max(300).optional().nullable(),
  manufacturer: z.string().trim().max(120).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('ACTIVE'),
});

export async function getAdminMedicines(filters = {}) {
  try {
    await requireAdmin();

    const {
      q = '',
      category = 'all',
      stockFilter = 'all', // 'all', 'low', 'out'
      page = 1,
      limit = 20,
    } = filters;

    const where = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { genericName: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category !== 'all') {
      where.category = category;
    }

    if (stockFilter === 'low') {
      where.stock = { gt: 0, lte: 15 };
    } else if (stockFilter === 'out') {
      where.stock = 0;
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [medicines, total, lowStockCount, outOfStockCount, totalCount] = await Promise.all([
      prisma.medicineProduct.findMany({
        where,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
        include: {
          batches: {
            orderBy: { expiryDate: 'asc' },
          },
        },
      }),
      prisma.medicineProduct.count({ where }),
      prisma.medicineProduct.count({ where: { stock: { gt: 0, lte: 15 } } }),
      prisma.medicineProduct.count({ where: { stock: 0 } }),
      prisma.medicineProduct.count(),
    ]);

    const categories = await prisma.medicineCategory.findMany({
      where: { isActive: true },
      select: { name: true, subcategories: true },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      medicines,
      total,
      lowStockCount,
      outOfStockCount,
      totalCount,
      categories,
      pageCount: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('getAdminMedicines error:', error);
    return { success: false, error: error.message };
  }
}

export async function upsertAdminMedicine(data) {
  try {
    await requireAdmin();

    const parsed = medicineInputSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Validation failed' };
    }

    const { id, ...medData } = parsed.data;

    if (id) {
      const updated = await prisma.medicineProduct.update({
        where: { id },
        data: medData,
      });
      revalidatePath('/admin/medicines');
      revalidatePath('/medicines');
      revalidatePath(`/medicines/${id}`);
      return { success: true, medicine: updated };
    }

    const catalogKey = `med-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const created = await prisma.medicineProduct.create({
      data: {
        catalogKey,
        ...medData,
        demoData: false,
        isActive: true,
      },
    });

    revalidatePath('/admin/medicines');
    revalidatePath('/medicines');
    return { success: true, medicine: created };
  } catch (error) {
    console.error('upsertAdminMedicine error:', error);
    return { success: false, error: error.message || 'Operation failed' };
  }
}

export async function updateMedicineStock(medicineId, newStock) {
  try {
    await requireAdmin();
    const stockVal = Math.max(0, parseInt(newStock, 10));

    await prisma.medicineProduct.update({
      where: { id: medicineId },
      data: { stock: stockVal },
    });

    revalidatePath('/admin/medicines');
    revalidatePath('/medicines');
    return { success: true };
  } catch (error) {
    console.error('updateMedicineStock error:', error);
    return { success: false, error: error.message };
  }
}

export async function addMedicineBatch({ medicineId, batchNumber, expiryDate, quantity }) {
  try {
    await requireAdmin();
    const qty = Math.max(1, parseInt(quantity, 10));
    const exp = new Date(expiryDate);

    await prisma.$transaction(async (tx) => {
      await tx.medicineBatch.create({
        data: {
          medicineId,
          batchNumber,
          expiryDate: exp,
          quantity: qty,
          initialQuantity: qty,
        },
      });

      // Also increment total medicine stock
      await tx.medicineProduct.update({
        where: { id: medicineId },
        data: { stock: { increment: qty } },
      });
    });

    revalidatePath('/admin/medicines');
    revalidatePath(`/medicines/${medicineId}`);
    return { success: true };
  } catch (error) {
    console.error('addMedicineBatch error:', error);
    return { success: false, error: error.message || 'Failed to add batch' };
  }
}

export async function toggleMedicineActive(medicineId) {
  try {
    await requireAdmin();
    const med = await prisma.medicineProduct.findUnique({
      where: { id: medicineId },
      select: { isActive: true },
    });
    if (!med) return { success: false, error: 'Product not found' };

    await prisma.medicineProduct.update({
      where: { id: medicineId },
      data: { isActive: !med.isActive },
    });

    revalidatePath('/admin/medicines');
    revalidatePath('/medicines');
    return { success: true };
  } catch (error) {
    console.error('toggleMedicineActive error:', error);
    return { success: false, error: error.message };
  }
}
