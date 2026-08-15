'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updatePatientProfile(data) {
  try {
    const session = await auth();
    if (!session) return { error: 'Not authenticated' };
    const patientId = session.user.patientId;
    const userId = session.user.id;

    if (data.type === 'personal') {
      await Promise.all([
        prisma.user.update({ where: { id: userId }, data: { name: data.name } }),
        patientId ? prisma.patient.update({
          where: { id: patientId },
          data: {
            phone: data.phone,
            address: data.address,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          },
        }) : null,
      ]);
    } else if (data.type === 'medical') {
      if (!patientId) return { error: 'No patient profile' };
      await prisma.patient.update({
        where: { id: patientId },
        data: {
          bloodGroup: data.bloodGroup,
          allergies: data.allergies,
          chronicDiseases: data.chronicDiseases,
        },
      });
    }

    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'Update failed' };
  }
}

export async function updatePassword({ currentPassword, newPassword }) {
  try {
    const session = await auth();
    if (!session) return { error: 'Not authenticated' };
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) return { error: 'No password set (OAuth account)' };
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return { error: 'Incorrect current password' };
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
    return { success: true };
  } catch { return { error: 'Failed to change password' }; }
}

export async function addMedicalHistory(data) {
  try {
    const session = await auth();
    if (!session || !session.user.patientId) return { error: 'Not authenticated' };
    const history = await prisma.medicalHistory.create({
      data: {
        patientId: session.user.patientId,
        condition: data.condition,
        diagnosedAt: data.diagnosedAt ? new Date(data.diagnosedAt) : null,
        treatment: data.treatment,
        notes: data.notes,
      },
    });
    revalidatePath('/dashboard/medical-history');
    return { success: true, history };
  } catch { return { error: 'Failed to add' }; }
}

export async function deleteMedicalHistory(id) {
  try {
    const session = await auth();
    if (!session) return { error: 'Not authenticated' };
    await prisma.medicalHistory.delete({ where: { id } });
    revalidatePath('/dashboard/medical-history');
    return { success: true };
  } catch { return { error: 'Failed to delete' }; }
}

export async function markNotificationRead(id) {
  try {
    const session = await auth();
    if (!session) return { error: 'Not authenticated' };
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return { success: true };
  } catch { return { error: 'Failed' }; }
}

export async function markAllNotificationsRead() {
  try {
    const session = await auth();
    if (!session) return { error: 'Not authenticated' };
    await prisma.notification.updateMany({ where: { userId: session.user.id, isRead: false }, data: { isRead: true } });
    return { success: true };
  } catch { return { error: 'Failed' }; }
}

export async function getFavoriteDoctors() {
  try {
    const session = await auth();
    if (!session || !session.user.patientId) return { doctors: [] };
    const patient = await prisma.patient.findUnique({
      where: { id: session.user.patientId },
      select: { favoriteDoctors: true },
    });
    if (!patient?.favoriteDoctors?.length) return { doctors: [] };
    const doctors = await prisma.doctor.findMany({
      where: { id: { in: patient.favoriteDoctors } },
      include: { user: { select: { name: true, image: true } } },
    });
    return { doctors };
  } catch { return { doctors: [] }; }
}

export async function toggleFavoriteDoctor(doctorId) {
  try {
    const session = await auth();
    if (!session || !session.user.patientId) return { error: 'Not authenticated' };
    const patient = await prisma.patient.findUnique({ where: { id: session.user.patientId }, select: { favoriteDoctors: true } });
    const isFav = patient?.favoriteDoctors?.includes(doctorId);
    await prisma.patient.update({
      where: { id: session.user.patientId },
      data: { favoriteDoctors: isFav ? patient.favoriteDoctors.filter(id => id !== doctorId) : [...(patient?.favoriteDoctors || []), doctorId] },
    });
    revalidatePath('/dashboard/favorites');
    return { success: true, isFavorite: !isFav };
  } catch { return { error: 'Failed' }; }
}
