'use server';
import { prisma } from '@/lib/prisma';
import { excludeDemoData } from '@/lib/demo-data';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendAppointmentConfirmation } from '@/lib/resend';
import { formatDate } from '@/lib/utils';
import { z } from 'zod';
import { getAppointmentBookingKey, getKarachiDateTime, parseAppointmentDate } from '@/lib/appointment-utils';
import QRCode from 'qrcode';

const appointmentInputSchema = z.object({
  doctorId: z.string().regex(/^[a-f\d]{24}$/i),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  reason: z.string().trim().min(1).max(500),
  symptoms: z.array(z.string().trim().min(1).max(100)).max(15).default([]),
  type: z.enum(['in-person', 'video']).default('in-person'),
});

export async function createAppointment(data) {
  try {
    const validation = appointmentInputSchema.safeParse(data);
    if (!validation.success) return { error: validation.error.issues[0]?.message || 'Please provide valid appointment details.' };
    const input = validation.data;
    const session = await auth();
    if (!session || session.user?.role !== 'PATIENT') return { error: 'Please sign in with a patient account to book an appointment.' };
    const patientId = session.user.patientId;
    if (!patientId) return { error: 'Patient profile not found' };

    const appointmentDate = parseAppointmentDate(input.date);
    if (!appointmentDate) return { error: 'Please choose a valid appointment date.' };
    const nowInKarachi = getKarachiDateTime();
    if (input.date < nowInKarachi.date || (input.date === nowInKarachi.date && input.startTime <= nowInKarachi.time)) {
      return { error: 'Please choose a future appointment time.' };
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: input.doctorId, status: 'APPROVED' },
      include: {
        user: { select: { name: true, email: true } },
        availability: { where: { dayOfWeek: appointmentDate.getUTCDay(), isAvailable: true } },
      },
    });
    if (!doctor) return { error: 'This doctor is not available for booking.' };
    if (doctor.demoData) return { error: 'Development demonstration profiles cannot accept appointments.' };

    const availability = doctor.availability[0];
    const isBlockedDate = availability?.blockedDates.some(blockedDate => blockedDate.toISOString().slice(0, 10) === input.date);
    const { generateTimeSlots } = await import('@/lib/utils');
    const requestedSlot = availability && generateTimeSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration,
    ).find(slot => slot.start === input.startTime && slot.end === input.endTime);
    if (!availability || isBlockedDate || !requestedSlot) {
      return { error: 'This time is not in the doctor’s current availability.' };
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: input.doctorId,
        date: appointmentDate,
        startTime: input.startTime,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'RESCHEDULED'] },
      },
      select: { id: true },
    });
    if (existingAppointment) return { error: 'This time slot is no longer available. Please choose another.' };

    let appointment;
    try {
      appointment = await prisma.appointment.create({
        data: {
          patientId,
          doctorId: input.doctorId,
          date: appointmentDate,
          startTime: input.startTime,
          endTime: input.endTime,
          reason: input.reason,
          symptoms: input.symptoms,
          type: input.type,
          consultationFee: doctor.consultationFee,
          bookingKey: getAppointmentBookingKey(input.doctorId, appointmentDate, input.startTime),
          status: 'PENDING',
        },
      });
    } catch (error) {
      if (error?.code === 'P2002') return { error: 'This time slot is no longer available. Please choose another.' };
      throw error;
    }

    const qrData = JSON.stringify({
      appointmentId: appointment.id,
      doctorId: input.doctorId,
      date: input.date,
      time: input.startTime,
    });
    const qrCode = await QRCode.toDataURL(qrData).catch(error => {
      console.error('Appointment QR code generation failed:', error);
      return null;
    });
    if (qrCode) {
      await prisma.appointment.update({ where: { id: appointment.id }, data: { qrCode } })
        .catch(error => console.error('Appointment QR code could not be saved:', error));
    }

    // Send an appointment request receipt; provider confirmation happens separately.
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });
    if (patient?.user?.email) {
      await sendAppointmentConfirmation({
        to: patient.user.email,
        patientName: patient.user.name,
        doctorName: doctor.user?.name || 'Your Doctor',
        date: formatDate(appointmentDate, 'PPP'),
        time: input.startTime,
        appointmentId: appointment.id,
      }).catch(console.error);
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'APPOINTMENT_BOOKED',
        title: 'Appointment Request Received',
        message: `Your appointment request with ${doctor.user?.name} on ${formatDate(appointmentDate, 'PPP')} at ${input.startTime} has been received and is pending confirmation.`,
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
      data: { status: 'CANCELLED', bookingKey: null },
    });

    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch {
    return { error: 'Failed to cancel appointment' };
  }
}

export async function getAvailableSlots(doctorId, date) {
  try {
    const appointmentDate = parseAppointmentDate(date);
    if (!appointmentDate || !/^[a-f\d]{24}$/i.test(doctorId)) return { slots: [] };
    const doctor = await prisma.doctor.findFirst({
      where: excludeDemoData({ id: doctorId, status: 'APPROVED' }),
      select: { id: true },
    });
    if (!doctor) return { slots: [] };
    const dayOfWeek = appointmentDate.getUTCDay();
    const availability = await prisma.availability.findFirst({
      where: { doctorId, dayOfWeek, isAvailable: true },
    });

    if (!availability) return { slots: [] };
    if (availability.blockedDates.some(blockedDate => blockedDate.toISOString().slice(0, 10) === date)) {
      return { slots: [] };
    }

    const bookedSlots = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: appointmentDate,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'RESCHEDULED'] },
      },
      select: { startTime: true },
    });

    const bookedTimes = bookedSlots.map(s => s.startTime);

    // Generate all slots
    const { generateTimeSlots } = await import('@/lib/utils');
    const allSlots = generateTimeSlots(availability.startTime, availability.endTime, availability.slotDuration);
    const nowInKarachi = getKarachiDateTime();
    const available = allSlots.filter(slot =>
      !bookedTimes.includes(slot.start) &&
      (date !== nowInKarachi.date || slot.start > nowInKarachi.time)
    );

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
      data: {
        status,
        bookingKey: status === 'CANCELLED'
          ? null
          : getAppointmentBookingKey(appointment.doctorId, appointment.date, appointment.startTime),
        ...(notes && { notes }),
      },
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
