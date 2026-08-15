import { prisma } from '@/lib/prisma';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const staticPages = [
    '', '/doctors', '/ai-symptom-checker', '/ai-health-assistant',
    '/pricing', '/blog', '/contact', '/faq', '/about', '/privacy-policy', '/terms',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  let doctorPages = [];
  let blogPages = [];
  try {
    const doctors = await prisma.doctor.findMany({ where: { status: 'APPROVED' }, select: { id: true, updatedAt: true } });
    doctorPages = doctors.map(d => ({
      url: `${baseUrl}/doctors/${d.id}`,
      lastModified: d.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    const posts = await prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } });
    blogPages = posts.map(p => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch { /* DB not connected during build */ }

  return [...staticPages, ...doctorPages, ...blogPages];
}
