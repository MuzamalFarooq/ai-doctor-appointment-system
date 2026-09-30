'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

// 1. Zod input validation schema
const BookAppointmentInputSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  slotDate: z.string().datetime({ message: 'Valid ISO date required' }),
  notes: z.string().max(500).optional(),
});

/**
 * Standard Production Server Action Template
 * Follows the 5-step lifecycle: Auth -> Authorize -> Validate -> Mutate(TX) -> Revalidate
 */
export async function bookAppointmentAction(rawInput) {
  try {
    // Phase 1: Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Authentication required. Please log in.',
        code: 'UNAUTHORIZED',
      };
    }

    // Phase 2: Schema Validation
    const parsed = BookAppointmentInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Validation failed',
        code: 'BAD_REQUEST',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    const { doctorId, slotDate, notes } = parsed.data;

    // Phase 3: Business Logic & Precondition Verification
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true, isAvailable: true, consultationFee: true },
    });

    if (!doctor || !doctor.isAvailable) {
      return {
        success: false,
        error: 'Doctor is not available for appointments.',
        code: 'DOCTOR_UNAVAILABLE',
      };
    }

    // Phase 4: Atomic Mutation via Transaction
    const appointment = await prisma.$transaction(async (tx) => {
      // Check for slot collisions
      const existing = await tx.appointment.findFirst({
        where: {
          doctorId,
          slotDate: new Date(slotDate),
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (existing) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      return await tx.appointment.create({
        data: {
          patientId: session.user.id,
          doctorId,
          slotDate: new Date(slotDate),
          notes,
          status: 'PENDING',
          fee: doctor.consultationFee,
        },
      });
    });

    // Phase 5: Cache Revalidation & Response
    revalidatePath('/dashboard/appointments');
    revalidatePath(`/doctors/${doctorId}`);
    revalidateTag('appointments');

    return {
      success: true,
      data: appointment,
      message: 'Appointment booked successfully!',
    };
  } catch (error) {
    if (error.message === 'SLOT_ALREADY_BOOKED') {
      return {
        success: false,
        error: 'This appointment slot was just taken. Please pick another time.',
        code: 'SLOT_CONFLICT',
      };
    }

    console.error('[BOOK_APPOINTMENT_ACTION_ERROR]', error);
    return {
      success: false,
      error: 'An unexpected error occurred while booking your appointment.',
      code: 'INTERNAL_ERROR',
    };
  }
}
