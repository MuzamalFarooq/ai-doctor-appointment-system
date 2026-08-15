import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AvailabilityClient } from '@/components/doctor/AvailabilityClient';

export const metadata = { title: 'Manage Availability' };

export default async function AvailabilityPage() {
  const session = await auth();
  const doctorId = session?.user?.doctorId;
  let availability = [];
  if (doctorId) {
    try { availability = await prisma.availability.findMany({ where: { doctorId }, orderBy: { dayOfWeek: 'asc' } }); } catch {}
  }
  return <AvailabilityClient availability={JSON.parse(JSON.stringify(availability))} />;
}
