'use server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validators';

export async function registerUser(data) {
  const input = {
    ...data,
    name: typeof data?.name === 'string' ? data.name.trim() : data?.name,
    email: typeof data?.email === 'string' ? data.email.trim().toLowerCase() : data?.email,
  };
  const validation = registerSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Please provide valid registration details.' };
  }

  const { name, email, password, role } = validation.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: 'Email already registered. Please sign in.' };

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        ...(role === 'PATIENT' && { patient: { create: {} } }),
        ...(role === 'DOCTOR' && { doctor: {
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
    const code = typeof err?.code === 'string' ? err.code : 'UNKNOWN';
    console.error('Registration failed:', { code });
    if (code === 'P2002') {
      return { error: 'Email already registered. Please sign in.' };
    }
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
