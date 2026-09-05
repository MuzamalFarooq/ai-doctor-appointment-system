'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');
  return session;
}

// User & Doctor Management
export async function toggleUserActive(userId) {
  try {
    await requireAdmin();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } });
    if (!user) return { error: 'User not found' };
    await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
    revalidatePath('/admin/patients');
    return { success: true };
  } catch { return { error: 'Failed' }; }
}

export async function suspendDoctor(doctorId) {
  try {
    await requireAdmin();
    await prisma.doctor.update({ where: { id: doctorId }, data: { status: 'SUSPENDED' } });
    revalidatePath('/admin/doctors');
    return { success: true };
  } catch { return { error: 'Failed to suspend' }; }
}

// Specializations
export async function createSpecialization(data) {
  try {
    await requireAdmin();
    const specialization = await prisma.specialization.create({
      data: { name: data.name, description: data.description, icon: data.icon, color: data.color },
    });
    revalidatePath('/admin/specializations');
    return { success: true, specialization };
  } catch (err) {
    if (err.code === 'P2002') return { error: 'Specialization already exists' };
    return { error: 'Failed to create' };
  }
}

export async function deleteSpecialization(id) {
  try {
    await requireAdmin();
    await prisma.specialization.delete({ where: { id } });
    revalidatePath('/admin/specializations');
    return { success: true };
  } catch { return { error: 'Failed to delete' }; }
}

// Stats & Overview
export async function getAdminStats() {
  try {
    await requireAdmin();
    const [totalUsers, totalDoctors, totalAppointments, totalRevenue, pendingDoctors] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.doctor.count({ where: { status: 'PENDING' } }),
    ]);
    return {
      totalUsers,
      totalDoctors,
      totalAppointments,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingDoctors,
    };
  } catch { return { totalUsers: 0, totalDoctors: 0, totalAppointments: 0, totalRevenue: 0, pendingDoctors: 0 }; }
}

// Appointments Actions
export async function updateAppointmentStatus(appointmentId, status) {
  try {
    await requireAdmin();
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });
    revalidatePath('/admin/appointments');
    revalidatePath('/admin/dashboard');
    return { success: true, appointment: updated };
  } catch {
    return { error: 'Failed to update appointment status' };
  }
}

export async function deleteAppointment(appointmentId) {
  try {
    await requireAdmin();
    await prisma.appointment.delete({
      where: { id: appointmentId },
    });
    revalidatePath('/admin/appointments');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch {
    return { error: 'Failed to delete appointment' };
  }
}

// Hospitals Management
export async function createHospital(data) {
  try {
    await requireAdmin();
    const hospital = await prisma.hospital.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        image: data.image || null,
        facilities: Array.isArray(data.facilities) ? data.facilities : [],
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    revalidatePath('/admin/hospitals');
    return { success: true, hospital };
  } catch { return { error: 'Failed to create hospital' }; }
}

export async function updateHospital(id, data) {
  try {
    await requireAdmin();
    const hospital = await prisma.hospital.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        image: data.image || null,
        facilities: Array.isArray(data.facilities) ? data.facilities : [],
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    revalidatePath('/admin/hospitals');
    return { success: true, hospital };
  } catch { return { error: 'Failed to update hospital' }; }
}

export async function toggleHospitalStatus(id) {
  try {
    await requireAdmin();
    const current = await prisma.hospital.findUnique({ where: { id }, select: { isActive: true } });
    if (!current) return { error: 'Hospital not found' };
    await prisma.hospital.update({ where: { id }, data: { isActive: !current.isActive } });
    revalidatePath('/admin/hospitals');
    return { success: true };
  } catch { return { error: 'Failed to toggle status' }; }
}

export async function deleteHospital(id) {
  try {
    await requireAdmin();
    await prisma.hospital.delete({ where: { id } });
    revalidatePath('/admin/hospitals');
    return { success: true };
  } catch { return { error: 'Failed to delete hospital' }; }
}

// Payments Management
export async function updatePaymentStatus(paymentId, status) {
  try {
    await requireAdmin();
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });
    revalidatePath('/admin/payments');
    revalidatePath('/admin/dashboard');
    return { success: true, payment: updated };
  } catch {
    return { error: 'Failed to update payment status' };
  }
}

// Coupons Management
export async function createCoupon(data) {
  try {
    await requireAdmin();
    const codeUpper = data.code.trim().toUpperCase();
    const existing = await prisma.coupon.findUnique({ where: { code: codeUpper } });
    if (existing) return { error: 'Coupon code already exists' };

    const coupon = await prisma.coupon.create({
      data: {
        code: codeUpper,
        discount: parseFloat(data.discount),
        isPercentage: data.isPercentage ?? true,
        maxUses: parseInt(data.maxUses || '100', 10),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive ?? true,
      },
    });
    revalidatePath('/admin/coupons');
    return { success: true, coupon };
  } catch {
    return { error: 'Failed to create coupon' };
  }
}

export async function toggleCouponActive(id) {
  try {
    await requireAdmin();
    const current = await prisma.coupon.findUnique({ where: { id }, select: { isActive: true } });
    if (!current) return { error: 'Coupon not found' };
    await prisma.coupon.update({ where: { id }, data: { isActive: !current.isActive } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch { return { error: 'Failed to update coupon status' }; }
}

export async function deleteCoupon(id) {
  try {
    await requireAdmin();
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch { return { error: 'Failed to delete coupon' }; }
}

// Reviews Management
export async function deleteReview(id) {
  try {
    await requireAdmin();
    const review = await prisma.review.findUnique({ where: { id }, select: { doctorId: true } });
    if (!review) return { error: 'Review not found' };

    await prisma.review.delete({ where: { id } });

    // Recalculate doctor rating
    const remaining = await prisma.review.findMany({ where: { doctorId: review.doctorId }, select: { rating: true } });
    const avg = remaining.length > 0 ? remaining.reduce((acc, r) => acc + r.rating, 0) / remaining.length : 0;
    await prisma.doctor.update({
      where: { id: review.doctorId },
      data: { rating: Math.round(avg * 10) / 10, totalReviews: remaining.length },
    });

    revalidatePath('/admin/reviews');
    return { success: true };
  } catch {
    return { error: 'Failed to delete review' };
  }
}

// Notifications Broadcast
export async function sendBroadcastNotification(data) {
  try {
    const session = await requireAdmin();
    const { title, message, targetRole, type = 'SYSTEM', link } = data;

    let userFilter = {};
    if (targetRole && targetRole !== 'ALL') {
      userFilter = { role: targetRole };
    }

    const targetUsers = await prisma.user.findMany({
      where: userFilter,
      select: { id: true },
    });

    if (targetUsers.length === 0) return { error: 'No users found in target group' };

    // Create notifications for all target users
    const notificationsData = targetUsers.map(u => ({
      userId: u.id,
      type: type,
      title: title,
      message: message,
      link: link || null,
      isRead: false,
    }));

    await prisma.notification.createMany({
      data: notificationsData,
    });

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'BROADCAST_NOTIFICATION',
        resource: 'Notification',
        details: { title, targetRole, recipientCount: targetUsers.length },
      },
    });

    revalidatePath('/admin/notifications');
    return { success: true, count: targetUsers.length };
  } catch (err) {
    console.error('Broadcast notification error:', err);
    return { error: 'Failed to send broadcast notification' };
  }
}

export async function deleteNotification(id) {
  try {
    await requireAdmin();
    await prisma.notification.delete({ where: { id } });
    revalidatePath('/admin/notifications');
    return { success: true };
  } catch {
    return { error: 'Failed to delete notification' };
  }
}

// Content / Blog Post CMS
export async function createBlogPost(data) {
  try {
    const session = await requireAdmin();
    const slug = (data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now().toString(36);
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        authorId: session.user.id,
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : []),
        category: data.category || 'General Health',
        isPublished: data.isPublished ?? false,
        readTime: parseInt(data.readTime || '5', 10),
      },
    });
    revalidatePath('/admin/content');
    return { success: true, post };
  } catch (err) {
    console.error('Create blog post error:', err);
    return { error: 'Failed to create article' };
  }
}

export async function updateBlogPost(id, data) {
  try {
    await requireAdmin();
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : []),
        category: data.category || 'General Health',
        isPublished: data.isPublished,
        readTime: parseInt(data.readTime || '5', 10),
      },
    });
    revalidatePath('/admin/content');
    return { success: true, post };
  } catch {
    return { error: 'Failed to update article' };
  }
}

export async function togglePublishBlogPost(id) {
  try {
    await requireAdmin();
    const current = await prisma.blogPost.findUnique({ where: { id }, select: { isPublished: true } });
    if (!current) return { error: 'Post not found' };
    await prisma.blogPost.update({
      where: { id },
      data: { isPublished: !current.isPublished },
    });
    revalidatePath('/admin/content');
    return { success: true };
  } catch {
    return { error: 'Failed to update publication status' };
  }
}

export async function deleteBlogPost(id) {
  try {
    await requireAdmin();
    await prisma.blogPost.delete({ where: { id } });
    revalidatePath('/admin/content');
    return { success: true };
  } catch {
    return { error: 'Failed to delete article' };
  }
}

// System Settings / Audit Log
export async function saveSystemSettings(settings) {
  try {
    const session = await requireAdmin();
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_SYSTEM_SETTINGS',
        resource: 'Settings',
        details: settings,
      },
    });
    revalidatePath('/admin/settings');
    return { success: true };
  } catch {
    return { error: 'Failed to save settings' };
  }
}

export async function getAuditLogs(limit = 50) {
  try {
    await requireAdmin();
    return await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch { return []; }
}
