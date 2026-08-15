import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PrescriptionsClient } from '@/components/patient/PrescriptionsClient';

export const metadata = { title: 'My Prescriptions' };

export default async function PrescriptionsPage() {
  const session = await auth();
  const patientId = session?.user?.patientId;
  let prescriptions = [];
  if (patientId) {
    try {
      prescriptions = await prisma.prescription.findMany({
        where: { patientId },
        include: {
          doctor: { include: { user: { select: { name: true } } } },
          appointment: { select: { date: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {}
  }
  return <PrescriptionsClient prescriptions={JSON.parse(JSON.stringify(prescriptions))} />;
}
