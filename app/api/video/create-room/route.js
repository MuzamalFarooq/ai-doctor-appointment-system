import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { appointmentId } = await req.json();
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (!process.env.DAILY_API_KEY) {
      return NextResponse.json({ error: 'Video service not configured' }, { status: 503 });
    }

    const roomName = `mediconnect-${appointmentId}`;
    const expiryTime = new Date(appointment.date);
    expiryTime.setHours(expiryTime.getHours() + 3);

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp: Math.floor(expiryTime.getTime() / 1000),
          enable_screenshare: true,
          enable_recording: false,
          max_participants: 2,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error || 'Failed to create room' }, { status: 500 });
    }

    const room = await response.json();
    const roomUrl = `https://${process.env.DAILY_DOMAIN || 'mediconnect.daily.co'}/${roomName}`;

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { videoRoomUrl: roomUrl },
    });

    return NextResponse.json({ url: roomUrl, roomName });
  } catch (err) {
    console.error('Video room error:', err);
    return NextResponse.json({ error: 'Failed to create video room' }, { status: 500 });
  }
}
