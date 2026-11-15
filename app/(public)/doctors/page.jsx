import { prisma } from '@/lib/prisma';
import { excludeDemoData } from '@/lib/demo-data';
import { SpecializedDirectoryClient } from '@/components/doctors/SpecializedDirectoryClient';

export const metadata = {
  title: 'Specialized Doctors Directory — MediConnect',
  description: 'Browse verified medical specialists across 18 medical departments in Pakistan. View profiles, fees, availability, and book appointments.',
};

export default async function DoctorsPage() {
  let doctors = [];
  let specialties = [];

  try {
    // Fetch all approved active doctors with user and hospital info
    const [fetchedDoctors, fetchedSpecialties] = await Promise.all([
      prisma.doctor.findMany({
        where: excludeDemoData({ status: 'APPROVED' }),
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          hospital: { select: { id: true, name: true, city: true, address: true } },
          availability: { where: { isAvailable: true } },
        },
        orderBy: [
          { rating: 'desc' },
          { experience: 'desc' },
        ],
      }),
      prisma.specialization.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    doctors = fetchedDoctors;
    specialties = fetchedSpecialties;
  } catch (error) {
    console.error('Error loading specialized doctors directory:', error);
  }

  return (
    <SpecializedDirectoryClient
      doctors={JSON.parse(JSON.stringify(doctors))}
      specialties={JSON.parse(JSON.stringify(specialties))}
    />
  );
}
