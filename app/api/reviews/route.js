import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'PATIENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const patientId = session.user.patientId;
    if (!patientId) return NextResponse.json({ error: 'Patient profile required' }, { status: 400 });

    const { doctorId, rating, comment } = await req.json();
    if (!doctorId || !rating) return NextResponse.json({ error: 'Doctor and rating required' }, { status: 400 });
    if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });

    const completedAppointment = await prisma.appointment.findFirst({
      where: { patientId, doctorId, status: 'COMPLETED' },
    });
    if (!completedAppointment) return NextResponse.json({ error: 'Can only review doctors you have seen' }, { status: 403 });

    const existing = await prisma.review.findFirst({ where: { patientId, doctorId } });
    let review;
    if (existing) {
      review = await prisma.review.update({ where: { id: existing.id }, data: { rating, comment } });
    } else {
      review = await prisma.review.create({ data: { patientId, doctorId, rating, comment } });
    }

    const allReviews = await prisma.review.findMany({ where: { doctorId }, select: { rating: true } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.doctor.update({ where: { id: doctorId }, data: { rating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length } });

    return NextResponse.json({ review });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get('doctorId');
  if (!doctorId) return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
  const reviews = await prisma.review.findMany({
    where: { doctorId },
    include: { patient: { include: { user: { select: { name: true, image: true } } } } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);
  return NextResponse.json({ reviews });
}
