# Server Actions & Mutation Security Guide

Server Actions are public HTTP endpoints under the hood. Treat them with the same security rigor as traditional REST API route handlers.

---

## 1. The 5-Step Action Security Pattern

Every production Server Action must follow these 5 phases:

```
1. AUTHENTICATE  -> Extract and verify the active session.
2. AUTHORIZE    -> Check role permissions or record ownership.
3. VALIDATE     -> Parse and validate inputs strictly using Zod.
4. MUTATE (TX)  -> Execute the mutation inside a database transaction.
5. REVALIDATE   -> Revalidate relevant cache paths/tags and return typed status.
```

---

## 2. Production Server Action Anatomy

```javascript
'use server';

import { auth } from '@/auth'; // or your NextAuth session provider
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CancelAppointmentSchema = z.object({
  appointmentId: z.string().cuid(),
  reason: z.string().min(5).max(300),
});

export async function cancelAppointmentAction(rawInput) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: Please log in' };
    }

    // 2. Validate input
    const parsed = CancelAppointmentSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input data',
        validationErrors: parsed.error.flatten().fieldErrors,
      };
    }
    const { appointmentId, reason } = parsed.data;

    // 3. Authorize ownership
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    const isPatient = appointment.patientId === session.user.id;
    const isDoctor = appointment.doctorId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return { success: false, error: 'Forbidden: You do not own this appointment' };
    }

    // 4. Mutate inside transaction
    const updated = await prisma.$transaction(async (tx) => {
      return await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledBy: session.user.id,
          cancelledAt: new Date(),
        },
      });
    });

    // 5. Revalidate Cache
    revalidatePath('/dashboard/appointments');
    revalidatePath(`/appointments/${appointmentId}`);

    return { success: true, data: updated };
  } catch (error) {
    console.error('[CANCEL_APPOINTMENT_ERROR]', error);
    return { success: false, error: 'Failed to cancel appointment. Please try again.' };
  }
}
```

---

## 3. The `redirect()` in `try/catch` Trap

Next.js implements `redirect()` by throwing an internal error named `NEXT_REDIRECT`.
If you wrap `redirect()` inside a standard `try/catch` block, the catch handler intercepts it, logs an error, and prevents the user from redirecting!

```javascript
// ❌ Bug: redirect is swallowed by catch block
try {
  await createRecord();
  redirect('/success'); // Throws NEXT_REDIRECT error!
} catch (error) {
  return { error: 'Failed' }; // User never gets redirected!
}

// ✅ Correct Pattern A: Check isRedirectError
import { isRedirectError } from 'next/dist/client/components/redirect-error';

try {
  await createRecord();
  redirect('/success');
} catch (error) {
  if (isRedirectError(error)) throw error; // Re-throw to allow Next.js to redirect!
  return { error: 'Failed' };
}

// ✅ Correct Pattern B: Call redirect outside try/catch
let isSuccess = false;
try {
  await createRecord();
  isSuccess = true;
} catch (error) {
  return { error: 'Failed' };
}

if (isSuccess) {
  redirect('/success');
}
```
