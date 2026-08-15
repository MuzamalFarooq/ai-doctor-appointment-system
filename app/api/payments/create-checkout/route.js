import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { appointmentId } = await req.json();
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: { include: { user: { select: { name: true } } } }, patient: { include: { user: { select: { email: true, name: true } } } } },
    });

    if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    if (appointment.patient.userId !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'pkr',
          product_data: {
            name: `Consultation with ${appointment.doctor.user?.name}`,
            description: `Appointment on ${new Date(appointment.date).toLocaleDateString()}`,
          },
          unit_amount: Math.round(appointment.consultationFee * 100),
        },
        quantity: 1,
      }],
      metadata: { appointmentId: appointment.id },
      customer_email: appointment.patient.user?.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/appointments?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/appointments?cancelled=true`,
      mode: 'payment',
    });

    await prisma.payment.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        patientId: appointment.patientId,
        amount: appointment.consultationFee,
        currency: 'PKR',
        method: 'STRIPE',
        status: 'PENDING',
        stripeSessionId: checkoutSession.id,
      },
      update: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
