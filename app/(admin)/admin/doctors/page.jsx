import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminDoctorsClient } from '@/components/admin/AdminDoctorsClient';

export const metadata = { title: 'Manage Doctors' };

export default async function AdminDoctorsPage() {
  let doctors = [];
  try {
    doctors = await prisma.doctor.findMany({
      include: { user: { select: { name: true, email: true, image: true } }, hospital: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  } catch {}
  return <AdminDoctorsClient doctors={JSON.parse(JSON.stringify(doctors))} />;
}
