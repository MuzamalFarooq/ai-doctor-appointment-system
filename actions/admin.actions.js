'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAppointmentBookingKey, parseAppointmentDate, getKarachiDateTime } from '@/lib/appointment-utils';
import { normalizeSpecialty } from '@/lib/doctor-specialties';
import { formatDate } from '@/lib/utils';

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
    const doc = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { status: true } });
    if (!doc) return { error: 'Doctor not found' };
    const nextStatus = doc.status === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    await prisma.doctor.update({ where: { id: doctorId }, data: { status: nextStatus } });
    revalidatePath('/admin/doctors');
    revalidatePath('/doctors');
    return { success: true, status: nextStatus };
  } catch { return { error: 'Failed to update status' }; }
}

export async function createDoctor(data) {
  try {
    await requireAdmin();
    const email = data.email?.toLowerCase().trim();
    if (!email) return { error: 'Doctor email is required' };
    if (!data.name?.trim()) return { error: 'Doctor name is required' };

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: 'A user with this email address already exists.' };

    const canonicalSpec = normalizeSpecialty(data.specialization);
    const specRecord = await prisma.specialization.findFirst({
      where: { name: { equals: canonicalSpec, mode: 'insensitive' } },
    });

    const photo = data.profilePhoto?.trim() || null;

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        role: 'DOCTOR',
        isActive: data.isActive !== undefined ? data.isActive : true,
        image: photo,
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: canonicalSpec,
        specializationId: specRecord?.id || null,
        degree: Array.isArray(data.degree) ? data.degree : [data.degree || 'MBBS'],
        experience: parseInt(data.experience) || 0,
        consultationFee: parseFloat(data.consultationFee) || 0,
        languages: Array.isArray(data.languages) ? data.languages : (data.languages ? [data.languages] : ['English', 'Urdu']),
        city: data.city?.trim() || 'Islamabad',
        location: data.location?.trim() || data.hospital?.trim() || null,
        biography: data.biography?.trim() || null,
        rating: parseFloat(data.rating) || 5.0,
        totalReviews: parseInt(data.totalReviews) || 1,
        profilePhoto: photo,
        status: data.status || 'APPROVED',
        isVerified: data.isVerified !== undefined ? data.isVerified : true,
        demoData: false,
        gender: data.gender || 'male',
        licenseNumber: data.licenseNumber?.trim() || null,
        education: data.education || [],
        awards: data.awards || [],
      },
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    });

    // Setup Availability schedules
    const days = Array.isArray(data.availableDays) && data.availableDays.length > 0
      ? data.availableDays.map(d => parseInt(d))
      : [1, 2, 3, 4, 5, 6]; // Default Monday - Saturday

    const startTime = data.startTime || '09:00';
    const endTime = data.endTime || '13:00';
    const slotDuration = parseInt(data.slotDuration) || 30;

    for (const dayOfWeek of days) {
      await prisma.availability.upsert({
        where: { doctorId_dayOfWeek: { doctorId: doctor.id, dayOfWeek } },
        update: { startTime, endTime, slotDuration, isAvailable: true, blockedDates: [] },
        create: { doctorId: doctor.id, dayOfWeek, startTime, endTime, slotDuration, isAvailable: true, blockedDates: [] },
      });
    }

    revalidatePath('/admin/doctors');
    revalidatePath('/doctors');
    revalidatePath('/doctors/search');
    revalidatePath('/dashboard/book-appointment');
    return { success: true, doctor };
  } catch (err) {
    console.error('Create doctor error:', err);
    return { error: 'Failed to create doctor profile. Please verify all inputs.' };
  }
}

export async function updateDoctor(doctorId, data) {
  try {
    await requireAdmin();
    const existing = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });
    if (!existing) return { error: 'Doctor not found' };

    const canonicalSpec = normalizeSpecialty(data.specialization || existing.specialization);
    const specRecord = await prisma.specialization.findFirst({
      where: { name: { equals: canonicalSpec, mode: 'insensitive' } },
    });

    const photo = data.profilePhoto !== undefined ? data.profilePhoto?.trim() || null : existing.profilePhoto;

    // Update user info
    if (data.name?.trim() || photo !== undefined) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: {
          ...(data.name?.trim() && { name: data.name.trim() }),
          ...(photo !== undefined && { image: photo }),
        },
      });
    }

    // Update doctor record
    const updated = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialization: canonicalSpec,
        specializationId: specRecord?.id || existing.specializationId,
        ...(data.degree && { degree: Array.isArray(data.degree) ? data.degree : [data.degree] }),
        ...(data.experience !== undefined && { experience: parseInt(data.experience) || 0 }),
        ...(data.consultationFee !== undefined && { consultationFee: parseFloat(data.consultationFee) || 0 }),
        ...(data.languages && { languages: Array.isArray(data.languages) ? data.languages : [data.languages] }),
        ...(data.city && { city: data.city.trim() }),
        ...(data.location !== undefined && { location: data.location?.trim() || null }),
        ...(data.biography !== undefined && { biography: data.biography?.trim() || null }),
        ...(data.status && { status: data.status }),
        ...(data.isVerified !== undefined && { isVerified: Boolean(data.isVerified) }),
        ...(data.gender && { gender: data.gender }),
        ...(data.licenseNumber !== undefined && { licenseNumber: data.licenseNumber?.trim() || null }),
        ...(photo !== undefined && { profilePhoto: photo }),
      },
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    });

    // Update schedule if provided
    if (Array.isArray(data.availableDays) && data.availableDays.length > 0) {
      const days = data.availableDays.map(d => parseInt(d));
      const startTime = data.startTime || '09:00';
      const endTime = data.endTime || '13:00';
      const slotDuration = parseInt(data.slotDuration) || 30;

      // Disable days not selected
      await prisma.availability.updateMany({
        where: { doctorId, dayOfWeek: { notIn: days } },
        data: { isAvailable: false },
      });

      for (const dayOfWeek of days) {
        await prisma.availability.upsert({
          where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } },
          update: { startTime, endTime, slotDuration, isAvailable: true },
          create: { doctorId, dayOfWeek, startTime, endTime, slotDuration, isAvailable: true, blockedDates: [] },
        });
      }
    }

    revalidatePath('/admin/doctors');
    revalidatePath('/doctors');
    revalidatePath(`/doctors/${doctorId}`);
    revalidatePath('/doctors/search');
    revalidatePath('/dashboard/book-appointment');
    revalidatePath('/dashboard/appointments');
    return { success: true, doctor: updated };
  } catch (err) {
    console.error('Update doctor error:', err);
    return { error: 'Failed to update doctor profile.' };
  }
}

export async function deleteDoctorSafe(doctorId) {
  try {
    await requireAdmin();
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        _count: { select: { appointments: true } },
      },
    });

    if (!doctor) return { error: 'Doctor not found' };

    const appointmentCount = doctor._count?.appointments || 0;

    // If appointments exist, safely deactivate to preserve historical medical records
    if (appointmentCount > 0) {
      await prisma.doctor.update({
        where: { id: doctorId },
        data: { status: 'SUSPENDED', isVerified: false },
      });
      await prisma.user.update({
        where: { id: doctor.userId },
        data: { isActive: false },
      });
      revalidatePath('/admin/doctors');
      revalidatePath('/doctors');
      return {
        success: true,
        action: 'deactivated',
        message: `This doctor has ${appointmentCount} appointment records. The profile was safely deactivated to preserve patient medical history.`,
      };
    }

    // No appointments: safely delete relations and doctor
    await prisma.availability.deleteMany({ where: { doctorId } });
    await prisma.review.deleteMany({ where: { doctorId } });
    await prisma.doctor.delete({ where: { id: doctorId } });
    await prisma.user.delete({ where: { id: doctor.userId } }).catch(() => {});

    revalidatePath('/admin/doctors');
    revalidatePath('/doctors');
    revalidatePath('/doctors/search');
    return { success: true, action: 'deleted' };
  } catch (err) {
    console.error('Delete doctor error:', err);
    return { error: 'Failed to delete doctor' };
  }
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
    const current = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true, date: true, startTime: true },
    });
    if (!current) return { error: 'Appointment not found' };
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        bookingKey: status === 'CANCELLED'
          ? null
          : getAppointmentBookingKey(current.doctorId, current.date, current.startTime),
      },
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

export async function rescheduleAppointment(appointmentId, newDateStr, newStartTime, newEndTime) {
  try {
    await requireAdmin();
    const appointmentDate = parseAppointmentDate(newDateStr);
    if (!appointmentDate) return { error: 'Invalid appointment date format' };

    const current = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });
    if (!current) return { error: 'Appointment not found' };

    // Check collision for new slot
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId: current.doctorId,
        date: appointmentDate,
        startTime: newStartTime,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'RESCHEDULED'] },
        NOT: { id: appointmentId },
      },
      select: { id: true },
    });

    if (existing) {
      return { error: 'This time slot is already booked. Please choose another.' };
    }

    const newBookingKey = getAppointmentBookingKey(current.doctorId, appointmentDate, newStartTime);
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date: appointmentDate,
        startTime: newStartTime,
        endTime: newEndTime || newStartTime,
        bookingKey: newBookingKey,
        status: 'RESCHEDULED',
      },
    });

    // Notify patient
    if (current.patient?.userId) {
      await prisma.notification.create({
        data: {
          userId: current.patient.userId,
          type: 'APPOINTMENT_RESCHEDULED',
          title: 'Appointment Rescheduled',
          message: `Your appointment with ${current.doctor?.user?.name || 'your doctor'} has been rescheduled to ${newDateStr} at ${newStartTime}.`,
          link: '/dashboard/appointments',
        },
      }).catch(console.error);
    }

    revalidatePath('/admin/appointments');
    revalidatePath('/dashboard/appointments');
    revalidatePath('/doctor/appointments');
    return { success: true, appointment: updated };
  } catch (err) {
    console.error('Reschedule error:', err);
    return { error: 'Failed to reschedule appointment' };
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
