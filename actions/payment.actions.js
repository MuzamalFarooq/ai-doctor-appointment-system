'use server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getPatientPayments() {
  const session = await auth();
  if (!session) return { error: 'Unauthorized' };
  try {
    const payments = await prisma.payment.findMany({
      where: { patient: { userId: session.user.id } },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: { select: { name: true, image: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { payments };
  } catch {
    return { error: 'Failed to fetch payments' };
  }
}

export async function getDoctorEarnings() {
  const session = await auth();
  if (!session || session.user.role !== 'DOCTOR') return { error: 'Unauthorized' };
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
    if (!doctor) return { error: 'Doctor not found' };
    const payments = await prisma.payment.findMany({
      where: { appointment: { doctorId: doctor.id }, status: 'PAID' },
      include: {
        appointment: {
          select: {
            date: true,
            patient: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    return { payments, total, count: payments.length };
  } catch {
    return { error: 'Failed to fetch earnings' };
  }
}

export async function getPaymentStats() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };
  try {
    const [paid, pending, failed] = await Promise.all([
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true }, _count: true }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'FAILED' } }),
    ]);
    return { paid: paid._count, totalRevenue: paid._sum.amount || 0, pending, failed };
  } catch {
    return { error: 'Failed to fetch payment stats' };
  }
}
