import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiLimiter } from '@/lib/rate-limit';

export async function GET(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    try { apiLimiter.check(ip); } catch { return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }); }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const specialization = searchParams.get('specialization') || '';
    const city = searchParams.get('city') || '';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'APPROVED';
    const minFee = parseFloat(searchParams.get('minFee') || '0');
    const maxFee = parseFloat(searchParams.get('maxFee') || '999999');
    const sort = searchParams.get('sort') || 'rating';

    const where = {
      status,
      ...(specialization && { specialization: { contains: specialization, mode: 'insensitive' } }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(search && { user: { name: { contains: search, mode: 'insensitive' } } }),
      consultationFee: { gte: minFee, lte: maxFee },
    };

    const orderBy = sort === 'fee_asc' ? { consultationFee: 'asc' } :
      sort === 'fee_desc' ? { consultationFee: 'desc' } :
      sort === 'experience' ? { experience: 'desc' } :
      { rating: 'desc' };

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          user: { select: { name: true, image: true } },
          hospital: { select: { name: true, city: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.doctor.count({ where }),
    ]);

    return NextResponse.json({ doctors, total, pages: Math.ceil(total / limit), page });
  } catch (err) {
    console.error('Doctors API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
