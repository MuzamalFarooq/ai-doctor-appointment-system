import { prisma } from '@/lib/prisma';
import { AdminAppointmentsClient } from '@/components/admin/AdminAppointmentsClient';

export const metadata = {
  title: 'Appointments Management',
};

export default async function AdminAppointmentsPage() {
  let appointments = [];
  try {
    appointments = await prisma.appointment.findMany({
      orderBy: { date: 'desc' },
      include: {
        patient: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        payment: {
          select: { id: true, amount: true, status: true, method: true },
        },
      },
    });
  } catch (err) {
    console.error('Error fetching admin appointments:', err);
  }

  return <AdminAppointmentsClient appointments={appointments} />;
}
