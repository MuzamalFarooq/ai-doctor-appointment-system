'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');
  return session;
}

export async function toggleUserActive(userId) {
  try {
    await requireAdmin();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } });
    if (!user) return { error: 'User not found' };
    await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
    revalidatePath('/admin/patients');
    return { success: true };
  } catch { return { error: 'Failed' }; }
}

export async function suspendDoctor(doctorId) {
  try {
    await requireAdmin();
    await prisma.doctor.update({ where: { id: doctorId }, data: { status: 'SUSPENDED' } });
    revalidatePath('/admin/doctors');
    return { success: true };
  } catch { return { error: 'Failed to suspend' }; }
}

export async function createSpecialization(data) {
  try {
    await requireAdmin();
    const specialization = await prisma.specialization.create({
      data: { name: data.name, description: data.description, icon: data.icon, color: data.color },
    });
    revalidatePath('/admin/specializations');
    return { success: true, specialization };
  } catch (err) {
    if (err.code === 'P2002') return { error: 'Specialization already exists' };
    return { error: 'Failed to create' };
  }
}

export async function deleteSpecialization(id) {
  try {
    await requireAdmin();
    await prisma.specialization.delete({ where: { id } });
    revalidatePath('/admin/specializations');
    return { success: true };
  } catch { return { error: 'Failed to delete' }; }
}

export async function getAdminStats() {
  try {
    await requireAdmin();
    const [totalUsers, totalDoctors, totalAppointments, totalRevenue, pendingDoctors] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.doctor.count({ where: { status: 'PENDING' } }),
    ]);
    return {
      totalUsers,
      totalDoctors,
      totalAppointments,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingDoctors,
    };
  } catch { return { totalUsers: 0, totalDoctors: 0, totalAppointments: 0, totalRevenue: 0, pendingDoctors: 0 }; }
}

export async function createHospital(data) {
  try {
    await requireAdmin();
    const hospital = await prisma.hospital.create({
      data: { name: data.name, address: data.address, city: data.city, phone: data.phone, email: data.email },
    });
    revalidatePath('/admin/hospitals');
    return { success: true, hospital };
  } catch { return { error: 'Failed to create hospital' }; }
}

export async function getAuditLogs(limit = 50) {
  try {
    await requireAdmin();
    return await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch { return []; }
}
