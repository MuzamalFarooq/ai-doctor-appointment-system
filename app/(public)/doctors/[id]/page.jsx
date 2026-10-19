import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { DoctorDetailClient } from '@/components/doctors/DoctorDetailClient';
import { excludeDemoData } from '@/lib/demo-data';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const doctor = await prisma.doctor.findFirst({
    where: process.env.NODE_ENV === 'development' ? { id } : excludeDemoData({ id }),
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
  const doctor = await prisma.doctor.findFirst({
    where: process.env.NODE_ENV === 'development'
      ? { id, status: 'APPROVED' }
      : excludeDemoData({ id, status: 'APPROVED' }),
    select: {
      id: true,
      specialization: true,
      degree: true,
      experience: true,
      consultationFee: true,
      city: true,
      location: true,
      education: true,
      awards: true,
      biography: true,
      rating: true,
      totalReviews: true,
      profilePhoto: true,
      demoData: true,
      status: true,
      isVerified: true,
      languages: true,
      gender: true,
      user: { select: { name: true, image: true } },
      hospital: { select: { name: true, address: true, city: true, image: true } },
      reviews: {
        include: { patient: { include: { user: { select: { name: true, image: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!doctor) notFound();
  if (doctor.demoData && process.env.NODE_ENV !== 'development') notFound();

  // Similar doctors
  const similarDoctors = await prisma.doctor.findMany({
    where: process.env.NODE_ENV === 'development' ? {
      specialization: doctor.specialization,
      status: 'APPROVED',
      NOT: { id },
    } : excludeDemoData({
      specialization: doctor.specialization,
      status: 'APPROVED',
      NOT: { id },
    }),
    take: 4,
    include: { user: { select: { name: true } }, hospital: { select: { name: true } } },
  });

  return <DoctorDetailClient doctor={JSON.parse(JSON.stringify(doctor))} similarDoctors={JSON.parse(JSON.stringify(similarDoctors))} />;
}
