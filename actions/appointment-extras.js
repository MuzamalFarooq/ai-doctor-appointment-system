'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateAppointmentStatus(appointmentId, status) {
  try {
    const session = await auth();
    if (!session) return { error: 'Not authenticated' };
    if (session.user.role !== 'DOCTOR' && session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });
    revalidatePath('/doctor/appointments');
    revalidatePath('/admin/appointments');
    return { success: true };
  } catch { return { error: 'Failed to update status' }; }
}

export async function saveAvailability(schedule) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'DOCTOR') return { error: 'Unauthorized' };
    const doctorId = session.user.doctorId;
    if (!doctorId) return { error: 'Doctor profile not found' };

    for (const slot of schedule) {
      await prisma.availability.upsert({
        where: { doctorId_dayOfWeek: { doctorId, dayOfWeek: slot.dayOfWeek } },
        create: { doctorId, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, slotDuration: slot.slotDuration, isAvailable: slot.isAvailable },
        update: { startTime: slot.startTime, endTime: slot.endTime, slotDuration: slot.slotDuration, isAvailable: slot.isAvailable },
      });
    }
    revalidatePath('/doctor/availability');
    return { success: true };
  } catch (err) {
    console.error('Save availability error:', err);
    return { error: 'Failed to save availability' };
  }
}
