import { prisma } from '@/lib/prisma';
import { AdminHospitalsClient } from '@/components/admin/AdminHospitalsClient';

export const metadata = {
  title: 'Hospitals & Medical Centers',
};

export default async function AdminHospitalsPage() {
  let hospitals = [];
  try {
    hospitals = await prisma.hospital.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { doctors: true },
        },
      },
    });
  } catch (err) {
    console.error('Error fetching hospitals:', err);
  }

  return <AdminHospitalsClient hospitals={hospitals} />;
}
