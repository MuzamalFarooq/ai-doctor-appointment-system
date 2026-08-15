import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DoctorAppointmentsClient } from '@/components/doctor/DoctorAppointmentsClient';

export const metadata = { title: 'Doctor Appointments' };

export default async function DoctorAppointmentsPage() {
  const session = await auth();
  const doctorId = session?.user?.doctorId;
  let appointments = [];
  if (doctorId) {
    try {
      appointments = await prisma.appointment.findMany({
        where: { doctorId },
        include: { patient: { include: { user: { select: { name: true, image: true } } } }, payment: true, prescription: { select: { id: true } } },
        orderBy: { date: 'desc' },
      });
    } catch {}
  }
  return <DoctorAppointmentsClient appointments={JSON.parse(JSON.stringify(appointments))} />;
}
