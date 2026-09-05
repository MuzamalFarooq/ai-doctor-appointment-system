import { prisma } from '@/lib/prisma';
import { AdminContentClient } from '@/components/admin/AdminContentClient';

export const metadata = {
  title: 'Content CMS & Blog',
};

export default async function AdminContentPage() {
  let posts = [];
  try {
    posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Error fetching blog posts:', err);
  }

  return <AdminContentClient posts={posts} />;
}
