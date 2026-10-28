'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  validateAndProcessImage,
  uploadAvatarToStorage,
  safeDeleteOldAvatar,
} from '@/lib/avatar-service';
import { deleteImage } from '@/lib/cloudinary';

export async function approveDoctor(doctorId) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };
  try {
    await prisma.doctor.update({
      where: { id: doctorId },
      data: { status: 'APPROVED', isVerified: true },
    });
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/doctors');
    return { success: true };
  } catch { return { error: 'Failed to approve doctor' }; }
}

export async function rejectDoctor(doctorId, reason) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };
  try {
    await prisma.doctor.update({
      where: { id: doctorId },
      data: { status: 'REJECTED' },
    });
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch { return { error: 'Failed to reject doctor' }; }
}

export async function updateDoctorProfile(doctorId, data) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };
  if (session.user.role !== 'ADMIN' && session.user.doctorId !== doctorId) return { error: 'Unauthorized' };
  try {
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialization: data.specialization,
        experience: parseInt(data.experience),
        consultationFee: parseFloat(data.consultationFee),
        city: data.city,
        biography: data.biography,
        languages: data.languages,
        degree: data.degree,
      },
    });
    revalidatePath('/doctor/profile');
    return { success: true };
  } catch { return { error: 'Failed to update profile' }; }
}

export async function getDoctorStats(doctorId) {
  try {
    const [totalAppointments, completedAppointments, totalEarnings] = await Promise.all([
      prisma.appointment.count({ where: { doctorId } }),
      prisma.appointment.count({ where: { doctorId, status: 'COMPLETED' } }),
      prisma.payment.aggregate({ where: { appointment: { doctorId }, status: 'PAID' }, _sum: { amount: true } }),
    ]);
    return {
      totalAppointments,
      completedAppointments,
      totalEarnings: totalEarnings._sum.amount || 0,
    };
  } catch { return { totalAppointments: 0, completedAppointments: 0, totalEarnings: 0 }; }
}

export async function suspendDoctor(doctorId) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };
  try {
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    const newStatus = doctor?.status === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    await prisma.doctor.update({ where: { id: doctorId }, data: { status: newStatus } });
    revalidatePath('/admin/doctors');
    return { success: true, status: newStatus };
  } catch { return { error: 'Failed to update doctor status' }; }
}

export async function saveAvailability(slots) {
  const session = await auth();
  if (!session || session.user.role !== 'DOCTOR') return { error: 'Unauthorized' };
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
    if (!doctor) return { error: 'Doctor profile not found' };

    // Upsert each day's availability
    await Promise.all(
      slots.map(slot =>
        prisma.availability.upsert({
          where: { doctorId_dayOfWeek: { doctorId: doctor.id, dayOfWeek: slot.dayOfWeek } },
          create: {
            doctorId: doctor.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotDuration: slot.slotDuration || 30,
            isAvailable: slot.isAvailable ?? true,
          },
          update: {
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotDuration: slot.slotDuration || 30,
            isAvailable: slot.isAvailable ?? true,
          },
        })
      )
    );

    revalidatePath('/doctor/availability');
    return { success: true };
  } catch (err) {
    console.error('Save availability error:', err);
    return { error: 'Failed to save availability' };
  }
}

export async function getDoctorAvailability(doctorId) {
  try {
    return prisma.availability.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  } catch { return []; }
}

export async function uploadDoctorAvatar(formData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized. Please log in to update your profile picture.' };
    }

    if (session.user.role !== 'DOCTOR' && session.user.role !== 'ADMIN') {
      return { error: 'Forbidden. Only doctors can modify doctor profile pictures.' };
    }

    if (!session.user.doctorId) {
      return { error: 'Doctor profile record not found for this account.' };
    }

    const file = formData?.get?.('file');
    if (!file || typeof file === 'string') {
      return { error: 'No image file provided.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate size, magic bytes, format and optimize
    const validation = await validateAndProcessImage(buffer);
    if (validation.error) {
      return { error: validation.error };
    }

    // Upload to storage provider
    const uploadResult = await uploadAvatarToStorage({
      buffer: validation.buffer,
      userId: session.user.doctorId,
      role: 'DOCTOR',
    });

    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: session.user.doctorId },
      select: {
        profilePhoto: true,
        user: { select: { image: true } },
      },
    });

    // Update database atomically across both User and Doctor models
    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { image: uploadResult.url },
        }),
        prisma.doctor.update({
          where: { id: session.user.doctorId },
          data: { profilePhoto: uploadResult.url },
        }),
      ]);
    } catch (dbErr) {
      console.error('Failed to update doctor profile image in database:', dbErr);
      // Clean up newly uploaded image to prevent orphans
      if (uploadResult.publicId) {
        await deleteImage(uploadResult.publicId).catch(() => {});
      }
      return { error: 'Database update failed. Please try again.' };
    }

    // Safely delete previous avatar from Cloudinary if applicable
    const oldImage = currentDoctor?.profilePhoto || currentDoctor?.user?.image;
    if (oldImage && oldImage !== uploadResult.url) {
      await safeDeleteOldAvatar(oldImage, session.user.id, session.user.doctorId);
    }

    revalidatePath('/doctor/profile');
    revalidatePath('/doctor/dashboard');
    revalidatePath('/doctors');
    revalidatePath(`/doctors/${session.user.doctorId}`);
    revalidatePath('/doctor/appointments');
    revalidatePath('/marketplace/healthcare');

    return { success: true, url: uploadResult.url };
  } catch (err) {
    console.error('uploadDoctorAvatar error:', err);
    return { error: err.message || 'Failed to upload doctor profile picture.' };
  }
}

export async function removeDoctorAvatar() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized. Please log in.' };
    }

    if (session.user.role !== 'DOCTOR' && session.user.role !== 'ADMIN') {
      return { error: 'Forbidden. Only doctors can modify doctor profile pictures.' };
    }

    if (!session.user.doctorId) {
      return { error: 'Doctor profile record not found.' };
    }

    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: session.user.doctorId },
      select: {
        profilePhoto: true,
        user: { select: { image: true } },
      },
    });

    const oldImage = currentDoctor?.profilePhoto || currentDoctor?.user?.image;
    if (!oldImage) {
      return { success: true, message: 'No profile picture to remove.' };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { image: null },
      }),
      prisma.doctor.update({
        where: { id: session.user.doctorId },
        data: { profilePhoto: null },
      }),
    ]);

    // Safely delete from Cloudinary if stored there
    await safeDeleteOldAvatar(oldImage, session.user.id, session.user.doctorId);

    revalidatePath('/doctor/profile');
    revalidatePath('/doctor/dashboard');
    revalidatePath('/doctors');
    revalidatePath(`/doctors/${session.user.doctorId}`);
    revalidatePath('/doctor/appointments');
    revalidatePath('/marketplace/healthcare');

    return { success: true };
  } catch (err) {
    console.error('removeDoctorAvatar error:', err);
    return { error: 'Failed to remove doctor profile picture.' };
  }
}
