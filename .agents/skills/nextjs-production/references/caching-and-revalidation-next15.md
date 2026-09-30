# Caching & Revalidation in Next.js 15+

Next.js 15 fundamentally changed default caching behavior. Understanding the modern caching model prevents stale data bugs and unwanted cache hits.

---

## 1. What Changed in Next.js 15

- **`fetch` requests are NO LONGER cached by default**:
  In Next.js 14, `fetch()` defaulted to `force-cache`. In Next.js 15, `fetch()` defaults to `no-store` (uncached).
- **Route Handlers (`GET`) are NO LONGER cached by default**:
  `GET` handlers now evaluate dynamically unless explicitly configured.
- **Client Navigations are NO LONGER aggressively cached**:
  The client router cache page segment reuse duration is now 0s by default for dynamic pages.

---

## 2. Explicit Caching Strategies

### A. Time-Based Revalidation (ISR - Incremental Static Regeneration)
Use when data can tolerate being up to N seconds stale:
```javascript
// Fetch cached for 60 seconds
const res = await fetch('https://api.example.com/doctors', {
  next: { revalidate: 60 },
});
```

### B. On-Demand Tag-Based Revalidation (Recommended)
Tag cached data with domain identifiers, then purge on mutation:
```javascript
// 1. Tag fetch call
const res = await fetch('https://api.example.com/doctors', {
  next: { tags: ['doctors-list'] },
});

// 2. Invalidate in Server Action after new doctor registers
import { revalidateTag } from 'next/cache';

export async function createDoctorAction(formData) {
  // ... mutation ...
  revalidateTag('doctors-list');
}
```

### C. Database Query Caching with `unstable_cache`
Prisma and ORM queries are not HTTP calls and are not automatically cached. Use `unstable_cache` for expensive DB aggregations:
```javascript
import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

export const getCachedTopSpecialties = unstable_cache(
  async () => {
    return await prisma.doctor.groupBy({
      by: ['specialization'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
  },
  ['top-specialties-cache-key'],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['specialties'],
  }
);
```

---

## 3. `revalidatePath` vs `revalidateTag`

| Function | Scope | When to Use |
| :--- | :--- | :--- |
| `revalidatePath('/dashboard')` | Purges cache for the specific URL route | After updating a single page or user's local dashboard |
| `revalidatePath('/doctors', 'page')` | Purges only the page data, preserving layouts | Fine-grained page refreshes |
| `revalidateTag('doctors')` | Purges any cached item tagged with `'doctors'` across the entire app | When a mutation impacts multiple pages (e.g. homepage, search, filters) |
