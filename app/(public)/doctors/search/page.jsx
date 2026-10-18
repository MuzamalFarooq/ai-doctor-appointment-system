import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { DoctorsClient } from '@/components/doctors/DoctorsClient';

export const metadata = {
  title: 'Find a Doctor',
  description: 'Search approved doctor profiles and explore consultation options.',
};

const filtersSchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  spec: z.string().trim().max(80).optional().default(''),
  city: z.string().trim().max(80).optional().default(''),
  gender: z.enum(['', 'male', 'female']).default(''),
  minExp: z.coerce.number().int().min(0).max(80).default(0),
  minFee: z.coerce.number().min(0).max(1000000).default(0),
  maxFee: z.coerce.number().min(0).max(1000000).default(99999),
  minRating: z.coerce.number().min(0).max(5).default(0),
  available: z.enum(['', 'true']).default(''),
  page: z.coerce.number().int().min(1).max(500).default(1),
  sort: z.enum(['rating', 'fee_asc', 'fee_desc', 'experience']).default('rating'),
  lang: z.string().trim().max(40).optional().default(''),
});

function paramValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DoctorSearchPage({ searchParams }) {
  const rawParams = await searchParams;
  const parsed = filtersSchema.safeParse(
    Object.fromEntries(Object.entries(rawParams || {}).map(([key, value]) => [key, paramValue(value)])),
  );
  const filters = parsed.success ? parsed.data : filtersSchema.parse({});
  const {
    q, spec, city, gender, minExp, minFee, maxFee, minRating, available, page, sort, lang,
  } = filters;

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
    ...(gender && { gender: { equals: gender, mode: 'insensitive' } }),
    ...(minRating > 0 && { rating: { gte: minRating }, totalReviews: { gt: 0 } }),
    consultationFee: { gte: minFee, lte: maxFee },
    ...(lang && { languages: { has: lang } }),
    ...(minExp > 0 && { experience: { gte: minExp } }),
    ...(available && { availability: { some: { isAvailable: true } } }),
  };

  const orderBy = sort === 'fee_asc' ? { consultationFee: 'asc' }
    : sort === 'fee_desc' ? { consultationFee: 'desc' }
      : sort === 'experience' ? { experience: 'desc' }
        : { rating: 'desc' };
  const limit = 12;
  const [doctors, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, image: true } },
        hospital: { select: { name: true } },
      },
    }),
    prisma.doctor.count({ where }),
  ]);

  return <DoctorsClient initialData={{ doctors, total, pages: Math.ceil(total / limit), page }} />;
}
