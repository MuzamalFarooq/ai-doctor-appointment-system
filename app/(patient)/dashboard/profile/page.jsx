import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PatientProfileClient } from '@/components/patient/PatientProfileClient';

export const metadata = { title: 'My Profile' };

export default async function ProfilePage() {
  const session = await auth();
  let user = null;
  let patient = null;
  if (session?.user?.id) {
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, image: true },
      });
      if (session.user.patientId) {
        patient = await prisma.patient.findUnique({ where: { id: session.user.patientId } });
      }
    } catch {}
  }
  return <PatientProfileClient user={JSON.parse(JSON.stringify(user))} patient={JSON.parse(JSON.stringify(patient))} />;
}
