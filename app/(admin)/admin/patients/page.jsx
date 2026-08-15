import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminPatientsClient } from '@/components/admin/AdminPatientsClient';

export const metadata = { title: 'Manage Patients' };

export default async function AdminPatientsPage() {
  let patients = [];
  try {
    patients = await prisma.patient.findMany({
      include: {
        user: { select: { name: true, email: true, image: true, isActive: true, createdAt: true } },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch {}
  return <AdminPatientsClient patients={JSON.parse(JSON.stringify(patients))} />;
}
