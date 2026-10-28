import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  validateAndProcessImage,
  uploadAvatarToStorage,
  safeDeleteOldAvatar,
} from '@/lib/avatar-service';
import { deleteImage } from '@/lib/cloudinary';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const uploadType = formData.get('type') || 'avatar';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate size, magic bytes, format, and optimize
    const validation = await validateAndProcessImage(buffer);
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Role-specific upload
    const isDoctor = session.user.role === 'DOCTOR';
    const storageTarget = isDoctor ? session.user.doctorId || session.user.id : session.user.id;
    const roleKey = isDoctor ? 'DOCTOR' : 'PATIENT';

    const result = await uploadAvatarToStorage({
      buffer: validation.buffer,
      userId: storageTarget,
      role: roleKey,
    });

    // If this upload is directly updating user profile picture:
    if (uploadType === 'avatar') {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { image: true },
      });

      try {
        if (isDoctor && session.user.doctorId) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: session.user.id },
              data: { image: result.url },
            }),
            prisma.doctor.update({
              where: { id: session.user.doctorId },
              data: { profilePhoto: result.url },
            }),
          ]);
        } else {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { image: result.url },
          });
          if (session.user.patientId) {
            await prisma.patient.update({
              where: { id: session.user.patientId },
              data: { profilePhoto: result.url },
            }).catch(() => {});
          }
        }
      } catch (dbErr) {
        console.error('API upload database error:', dbErr);
        if (result.publicId) {
          await deleteImage(result.publicId).catch(() => {});
        }
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // Safe cleanup of old avatar
      if (currentUser?.image && currentUser.image !== result.url) {
        await safeDeleteOldAvatar(currentUser.image, session.user.id, session.user.doctorId);
      }
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (err) {
    console.error('Upload route error:', err);
    return NextResponse.json(
      { error: err.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
