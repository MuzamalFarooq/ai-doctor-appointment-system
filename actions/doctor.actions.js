'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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
