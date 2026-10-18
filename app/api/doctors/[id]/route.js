import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const doctor = await prisma.doctor.findUnique({
      where: { id, status: 'APPROVED' },
      select: {
        id: true,
        specialization: true,
        degree: true,
        experience: true,
        consultationFee: true,
        city: true,
        status: true,
        user: { select: { name: true, image: true } },
      },
    });
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    return NextResponse.json(doctor);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
