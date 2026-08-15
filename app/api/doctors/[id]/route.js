import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true, image: true } },
        hospital: true,
        reviews: {
          include: { patient: { include: { user: { select: { name: true, image: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        availability: { where: { isAvailable: true }, orderBy: { dayOfWeek: 'asc' } },
      },
    });
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    return NextResponse.json(doctor);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
