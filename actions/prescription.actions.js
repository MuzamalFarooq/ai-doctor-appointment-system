'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createPrescription(data) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'DOCTOR') return { error: 'Unauthorized' };
    const doctorId = session.user.doctorId;

    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      select: { patientId: true, doctorId: true },
    });
    if (!appointment) return { error: 'Appointment not found' };
    if (appointment.doctorId !== doctorId) return { error: 'Unauthorized' };

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId: data.appointmentId,
        doctorId,
        patientId: appointment.patientId,
        medicines: data.medicines,
        diagnosis: data.diagnosis,
        instructions: data.instructions,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
    });

    // Create notification for patient's user
    const patient = await prisma.patient.findUnique({ where: { id: appointment.patientId }, select: { userId: true } });
    if (patient) {
      await prisma.notification.create({
        data: {
          userId: patient.userId,
          type: 'PRESCRIPTION_ADDED',
          title: 'New Prescription',
          message: 'Your doctor has added a prescription for your recent appointment.',
          link: '/dashboard/prescriptions',
        },
      }).catch(() => {});
    }

    revalidatePath('/doctor/appointments');
    revalidatePath('/dashboard/prescriptions');
    return { success: true, prescriptionId: prescription.id };
  } catch (err) {
    console.error('Create prescription error:', err);
    return { error: 'Failed to create prescription' };
  }
}

export async function getDoctorPrescriptions(doctorId) {
  try {
    return await prisma.prescription.findMany({
      where: { doctorId },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        appointment: { select: { date: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch { return []; }
}
