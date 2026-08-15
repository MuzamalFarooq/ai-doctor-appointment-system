'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendAppointmentConfirmation } from '@/lib/resend';
import { formatDate } from '@/lib/utils';
import QRCode from 'qrcode';

export async function createAppointment(data) {
  try {
    const session = await auth();
    if (!session) return { error: 'Authentication required' };
    const patientId = session.user.patientId;
    if (!patientId) return { error: 'Patient profile not found' };

    // Check slot availability
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: new Date(data.date),
        startTime: data.startTime,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
    if (existing) return { error: 'This time slot is no longer available' };

    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
      include: { user: true },
    });
    if (!doctor) return { error: 'Doctor not found' };

    // Generate QR code
    const qrData = JSON.stringify({ appointmentId: 'pending', doctorId: data.doctorId, date: data.date, time: data.startTime });
    const qrCode = await QRCode.toDataURL(qrData).catch(() => null);

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: data.doctorId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime || data.startTime,
        reason: data.reason,
        symptoms: data.symptoms || [],
        type: data.type || 'in-person',
        consultationFee: doctor.consultationFee,
        qrCode,
        status: 'PENDING',
      },
    });

    // Send confirmation email
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });
    if (patient?.user?.email) {
      await sendAppointmentConfirmation({
        to: patient.user.email,
        patientName: patient.user.name,
        doctorName: doctor.user?.name || 'Your Doctor',
        date: formatDate(new Date(data.date), 'PPP'),
        time: data.startTime,
        appointmentId: appointment.id,
      }).catch(console.error);
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'APPOINTMENT_BOOKED',
        title: 'Appointment Booked',
        message: `Your appointment with ${doctor.user?.name} on ${formatDate(new Date(data.date), 'PPP')} at ${data.startTime} has been confirmed.`,
        link: '/dashboard/appointments',
      },
    }).catch(console.error);

    revalidatePath('/dashboard/appointments');
    return { success: true, appointmentId: appointment.id };
  } catch (err) {
    console.error('Create appointment error:', err);
    return { error: 'Failed to book appointment. Please try again.' };
  }
}

export async function cancelAppointment(appointmentId) {
  try {
    const session = await auth();
    if (!session) return { error: 'Authentication required' };

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    if (!appointment) return { error: 'Appointment not found' };
    if (appointment.patient.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });

    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch {
    return { error: 'Failed to cancel appointment' };
  }
}

export async function getAvailableSlots(doctorId, date) {
  try {
    const dayOfWeek = new Date(date).getDay();
    const availability = await prisma.availability.findFirst({
      where: { doctorId, dayOfWeek, isAvailable: true },
    });

    if (!availability) return { slots: [] };

    const bookedSlots = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { startTime: true },
    });

    const bookedTimes = bookedSlots.map(s => s.startTime);

    // Generate all slots
    const { generateTimeSlots } = await import('@/lib/utils');
    const allSlots = generateTimeSlots(availability.startTime, availability.endTime, availability.slotDuration);
    const available = allSlots.filter(s => !bookedTimes.includes(s.start));

    return { slots: available };
  } catch {
    return { slots: [] };
  }
}

export async function updateAppointmentStatus(appointmentId, status, notes) {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true },
    });
    if (!appointment) return { error: 'Appointment not found' };

    // Doctors can update status of their own appointments; admins can update any
    if (
      session.user.role !== 'ADMIN' &&
      appointment.doctor.userId !== session.user.id
    ) {
      return { error: 'Unauthorized' };
    }

    const validStatuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'];
    if (!validStatuses.includes(status)) return { error: 'Invalid status' };

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status, ...(notes && { notes }) },
    });

    revalidatePath('/doctor/appointments');
    revalidatePath('/dashboard/appointments');
    revalidatePath('/admin/appointments');
    return { success: true };
  } catch {
    return { error: 'Failed to update appointment status' };
  }
}

export async function getAppointmentById(appointmentId) {
  try {
    return prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: { select: { name: true, image: true } } } },
        patient: { include: { user: { select: { name: true, image: true } } } },
        prescription: true,
        payment: true,
      },
    });
  } catch { return null; }
}
