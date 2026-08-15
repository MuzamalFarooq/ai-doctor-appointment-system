import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SpecializationsClient } from '@/components/admin/SpecializationsClient';

export const metadata = { title: 'Manage Specializations' };

export default async function SpecializationsPage() {
  let specializations = [];
  try { specializations = await prisma.specialization.findMany({ orderBy: { name: 'asc' } }); } catch {}
  return <SpecializationsClient specializations={JSON.parse(JSON.stringify(specializations))} />;
}
