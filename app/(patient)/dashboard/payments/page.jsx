import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentsClient } from '@/components/patient/PaymentsClient';

export const metadata = { title: 'Payment History' };

export default async function PaymentsPage() {
  const session = await auth();
  const patientId = session?.user?.patientId;
  let payments = [];
  if (patientId) {
    try {
      payments = await prisma.payment.findMany({
        where: { patientId },
        include: { appointment: { include: { doctor: { include: { user: { select: { name: true } } } } } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch {}
  }
  return <PaymentsClient payments={JSON.parse(JSON.stringify(payments))} />;
}
