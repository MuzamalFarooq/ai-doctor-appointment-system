import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationsClient } from '@/components/patient/NotificationsClient';

export const metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const session = await auth();
  let notifications = [];
  if (session?.user?.id) {
    try {
      notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch {}
  }
  return <NotificationsClient notifications={JSON.parse(JSON.stringify(notifications))} />;
}
