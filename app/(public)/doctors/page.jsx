import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { DoctorsClient } from '@/components/doctors/DoctorsClient';
import { DoctorCardSkeleton } from '@/components/ui/Skeleton';

export const metadata = {
  title: 'Find Doctors',
  description: 'Find and book appointments with top-rated doctors in Pakistan.',
};

async function getDoctors(searchParams) {
  const {
    q = '', spec = '', city = '', gender = '', minExp = 0, maxFee = 99999,
    minRating = 0, available = '', page = 1, sort = 'rating', lang = ''
  } = await searchParams;

  const where = {
    status: 'APPROVED',
    ...(q && {
      OR: [
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { specialization: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(spec && { specialization: { contains: spec, mode: 'insensitive' } }),
    ...(city && { city: { contains: city, mode: 'insensitive' } }),
    ...(gender && { gender }),
    ...(minRating > 0 && { rating: { gte: parseFloat(minRating) } }),
    ...(maxFee < 99999 && { consultationFee: { lte: parseFloat(maxFee) } }),
    ...(lang && { languages: { has: lang } }),
    ...(parseInt(minExp) > 0 && { experience: { gte: parseInt(minExp) } }),
  };

  const orderBy = sort === 'fee_asc' ? { consultationFee: 'asc' }
    : sort === 'fee_desc' ? { consultationFee: 'desc' }
    : sort === 'experience' ? { experience: 'desc' }
    : { rating: 'desc' };

  const pageNum = parseInt(page);
  const limit = 12;
  const skip = (pageNum - 1) * limit;

  const [doctors, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { user: { select: { name: true, image: true } }, hospital: { select: { name: true } } },
    }),
    prisma.doctor.count({ where }),
  ]);

  return { doctors, total, pages: Math.ceil(total / limit), page: pageNum };
}

export default async function DoctorsPage({ searchParams }) {
  const data = await getDoctors(searchParams);
  return <DoctorsClient initialData={data} />;
}
