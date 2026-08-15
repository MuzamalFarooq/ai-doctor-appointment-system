import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const appointmentId = session.metadata?.appointmentId;
        if (appointmentId) {
          await prisma.payment.update({
            where: { appointmentId },
            data: { status: 'PAID', stripeSessionId: session.id, stripePaymentId: session.payment_intent },
          });
          await prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'CONFIRMED' } });
          const payment = await prisma.payment.findUnique({ where: { appointmentId }, include: { patient: { select: { userId: true } } } });
          if (payment?.patient?.userId) {
            await prisma.notification.create({
              data: {
                userId: payment.patient.userId,
                type: 'PAYMENT_RECEIVED',
                title: 'Payment Confirmed',
                message: `Your payment of PKR ${payment.amount.toLocaleString()} has been confirmed. Your appointment is now confirmed.`,
                link: '/dashboard/appointments',
              },
            });
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const appointmentId = paymentIntent.metadata?.appointmentId;
        if (appointmentId) {
          await prisma.payment.update({ where: { appointmentId }, data: { status: 'FAILED' } }).catch(() => {});
        }
        break;
      }
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };
