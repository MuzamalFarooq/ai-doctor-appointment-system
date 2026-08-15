'use server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function createReview({ doctorId, rating, comment }) {
  const session = await auth();
  if (!session || session.user.role !== 'PATIENT') return { error: 'Unauthorized' };
  if (!doctorId || !rating || rating < 1 || rating > 5) return { error: 'Invalid data' };
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
    if (!patient) return { error: 'Patient profile not found' };
    const completed = await prisma.appointment.findFirst({
      where: { patientId: patient.id, doctorId, status: 'COMPLETED' },
    });
    if (!completed) return { error: 'You can only review doctors you have consulted' };
    const existing = await prisma.review.findFirst({ where: { patientId: patient.id, doctorId } });
    let review;
    if (existing) {
      review = await prisma.review.update({ where: { id: existing.id }, data: { rating, comment } });
    } else {
      review = await prisma.review.create({ data: { patientId: patient.id, doctorId, rating, comment } });
    }
    const all = await prisma.review.findMany({ where: { doctorId }, select: { rating: true } });
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    await prisma.doctor.update({
      where: { id: doctorId },
      data: { rating: Math.round(avg * 10) / 10, totalReviews: all.length },
    });
    return { success: true, review };
  } catch {
    return { error: 'Failed to save review' };
  }
}

export async function getDoctorReviews(doctorId) {
  try {
    const reviews = await prisma.review.findMany({
      where: { doctorId },
      include: { patient: { include: { user: { select: { name: true, image: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return { reviews };
  } catch {
    return { reviews: [] };
  }
}

export async function replyToReview(reviewId, reply) {
  const session = await auth();
  if (!session || session.user.role !== 'DOCTOR') return { error: 'Unauthorized' };
  try {
    await prisma.review.update({ where: { id: reviewId }, data: { reply } });
    return { success: true };
  } catch {
    return { error: 'Failed to reply' };
  }
}
