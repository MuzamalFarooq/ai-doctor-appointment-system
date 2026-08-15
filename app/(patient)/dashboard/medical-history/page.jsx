import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MedicalHistoryClient } from '@/components/patient/MedicalHistoryClient';

export const metadata = { title: 'Medical History' };

export default async function MedicalHistoryPage() {
  const session = await auth();
  const patientId = session?.user?.patientId;

  let patient = null;
  let history = [];
  if (patientId) {
    try {
      [patient, history] = await Promise.all([
        prisma.patient.findUnique({ where: { id: patientId }, include: { user: { select: { name: true } } } }),
        prisma.medicalHistory.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
      ]);
    } catch {}
  }
  return <MedicalHistoryClient patient={JSON.parse(JSON.stringify(patient))} history={JSON.parse(JSON.stringify(history))} />;
}
