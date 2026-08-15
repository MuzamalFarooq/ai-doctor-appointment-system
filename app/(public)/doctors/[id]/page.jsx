import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { DoctorDetailClient } from '@/components/doctors/DoctorDetailClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!doctor) return { title: 'Doctor Not Found' };
  return {
    title: `${doctor.user?.name} — ${doctor.specialization}`,
    description: doctor.biography || `Book an appointment with ${doctor.user?.name}, a ${doctor.specialization} with ${doctor.experience} years of experience.`,
  };
}

export default async function DoctorDetailPage({ params }) {
  const { id } = await params;
  const doctor = await prisma.doctor.findUnique({
    where: { id, status: 'APPROVED' },
    include: {
      user: { select: { name: true, image: true, email: true } },
      hospital: true,
      reviews: {
        include: { patient: { include: { user: { select: { name: true, image: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      availability: true,
    },
  });

  if (!doctor) notFound();

  // Similar doctors
  const similarDoctors = await prisma.doctor.findMany({
    where: { specialization: doctor.specialization, status: 'APPROVED', NOT: { id } },
    take: 4,
    include: { user: { select: { name: true } }, hospital: { select: { name: true } } },
  });

  return <DoctorDetailClient doctor={JSON.parse(JSON.stringify(doctor))} similarDoctors={JSON.parse(JSON.stringify(similarDoctors))} />;
}
