import { prisma } from '@/lib/prisma';
import { AdminNotificationsClient } from '@/components/admin/AdminNotificationsClient';

export const metadata = {
  title: 'Notifications & Broadcasts',
};

export default async function AdminNotificationsPage() {
  let notifications = [];
  try {
    notifications = await prisma.notification.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  } catch (err) {
    console.error('Error fetching admin notifications:', err);
  }

  return <AdminNotificationsClient notifications={notifications} />;
}
