import { prisma } from '@/lib/prisma';
import { AdminReviewsClient } from '@/components/admin/AdminReviewsClient';

export const metadata = {
  title: 'Doctor Reviews Moderation',
};

export default async function AdminReviewsPage() {
  let reviews = [];
  try {
    reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });
  } catch (err) {
    console.error('Error fetching admin reviews:', err);
  }

  return <AdminReviewsClient reviews={reviews} />;
}
