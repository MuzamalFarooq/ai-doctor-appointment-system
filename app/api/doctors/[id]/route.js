import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { excludeDemoData } from '@/lib/demo-data';

export async function GET(req, { params }) {
  try {
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
        status: true,
        demoData: true,
        user: { select: { name: true, image: true } },
      },
    });
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    return NextResponse.json(doctor);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
