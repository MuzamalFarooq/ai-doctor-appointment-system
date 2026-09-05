import { prisma } from '@/lib/prisma';
import { AdminCouponsClient } from '@/components/admin/AdminCouponsClient';

export const metadata = {
  title: 'Discount Coupons',
};

export default async function AdminCouponsPage() {
  let coupons = [];
  try {
    coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Error fetching coupons:', err);
  }

  return <AdminCouponsClient coupons={coupons} />;
}
