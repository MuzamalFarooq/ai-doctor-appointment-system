# Performance, Core Web Vitals & SEO Guide

Building for production means optimizing for Core Web Vitals (LCP, INP, CLS) and ensuring high search engine rankings through automated SEO metadata.

---

## 1. Core Web Vitals (CWV) Optimization

### A. Largest Contentful Paint (LCP < 2.5s)
- **The Priority Image Rule**:
  Mark the single primary hero image above the fold with `priority`:
  ```jsx
  <Image
    src="/hero-clinic.webp"
    alt="Modern Medical Clinic"
    width={1200}
    height={600}
    priority
    sizes="(max-width: 768px) 100vw, 1200px"
    className="rounded-2xl object-cover"
  />
  ```
- **Font Optimization**:
  Always load Google fonts via `next/font/google` with `display: 'swap'` and `variable`:
  ```javascript
  import { Plus_Jakarta_Sans } from 'next/font/google';
  const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-jakarta',
  });
  ```

### B. Interaction to Next Paint (INP < 200ms)
- Defer non-critical work away from the main thread.
- Avoid large state updates inside rapid input typing handlers; debounce searches.
- Use `useTransition` or `useOptimistic` to show immediate visual feedback without blocking the user.

### C. Cumulative Layout Shift (CLS < 0.1)
- Never render images or banners without explicit aspect ratios or skeleton placeholders.
- Reserve container space for dynamic asynchronous content with `<Suspense fallback={<SkeletonHeight />}>`.

---

## 2. Dynamic Code Splitting with `next/dynamic`

Heavy libraries that are only needed on client interaction or on specific pages should be dynamically loaded:

```jsx
'use client';

import dynamic from 'next/dynamic';

// Heavy chart library only loaded when user opens analytics tab
const DoctorAnalyticsChart = dynamic(
  () => import('@/components/charts/DoctorAnalyticsChart'),
  {
    loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />,
    ssr: false, // Chart requires canvas/window
  }
);
```

---

## 3. SEO & Metadata Generation

### Dynamic OpenGraph & Meta Tags
Implement `generateMetadata` for dynamic doctor profiles and blog posts:

```javascript
// app/doctors/[slug]/page.jsx
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doctor = await prisma.doctor.findUnique({ where: { slug } });

  if (!doctor) {
    return { title: 'Doctor Not Found | MediConnect' };
  }

  const title = `Dr. ${doctor.name} - ${doctor.specialization} | MediConnect`;
  const description = `Book an appointment with Dr. ${doctor.name}, specialist in ${doctor.specialization}. Read reviews and check availability online.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: doctor.avatarUrl || '/images/default-doctor-og.png',
          width: 1200,
          height: 630,
          alt: doctor.name,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
```
