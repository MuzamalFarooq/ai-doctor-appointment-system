import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppointmentsClient } from '@/components/appointments/AppointmentsClient';

export const metadata = { title: 'My Appointments' };

export default async function AppointmentsPage() {
  const session = await auth();
  const patientId = session?.user?.patientId;
  
  let appointments = [];
  if (patientId) {
    try {
      appointments = await prisma.appointment.findMany({
        where: { patientId },
        include: {
          doctor: { include: { user: { select: { name: true, image: true } }, hospital: { select: { name: true } } } },
          payment: true,
          prescription: true,
        },
        orderBy: { date: 'desc' },
      });
    } catch {}
  }

  return <AppointmentsClient appointments={JSON.parse(JSON.stringify(appointments))} />;
}
