'use server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function registerUser(data) {
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return { error: 'Email already registered. Please sign in.' };
    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        role: data.role || 'PATIENT',
        ...(data.role === 'PATIENT' && { patient: { create: {} } }),
        ...(data.role === 'DOCTOR' && { doctor: {
          create: {
            specialization: 'General Physician',
            experience: 0,
            consultationFee: 1000,
            city: '',
            degree: [],
            languages: ['English'],
            status: 'PENDING',
          }
        }}),
      },
    });
    return { success: true, userId: user.id };
  } catch (err) {
    console.error('Register error:', err);
    return { error: 'Registration failed. Please try again.' };
  }
}

export async function getUserProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { doctor: true, patient: true },
  });
}

export async function updateUserProfile(userId, data) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name, image: data.image },
    });
    return { success: true };
  } catch {
    return { error: 'Failed to update profile' };
  }
}
