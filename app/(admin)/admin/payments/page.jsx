import { prisma } from '@/lib/prisma';
import { AdminPaymentsClient } from '@/components/admin/AdminPaymentsClient';

export const metadata = {
  title: 'Payments & Revenue',
};

export default async function AdminPaymentsPage() {
  let payments = [];
  try {
    payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        appointment: {
          include: {
            doctor: {
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
            },
          },
        },
      },
    });
  } catch (err) {
    console.error('Error fetching admin payments:', err);
  }

  return <AdminPaymentsClient payments={payments} />;
}
