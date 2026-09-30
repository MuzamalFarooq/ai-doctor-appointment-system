# Performance & Database Optimization Guide

A Senior Software Engineer treats performance as a feature, measuring before and after optimizing, and eliminating common bottlenecks at the database and application layers.

---

## 1. Database Optimization

### A. The N+1 Query Problem
The most common backend performance killer:
```javascript
// ❌ Poor (N+1 queries: 1 query for appointments, plus 50 queries for each doctor)
const appointments = await prisma.appointment.findMany({ take: 50 });
for (const appt of appointments) {
  appt.doctor = await prisma.doctor.findUnique({ where: { id: appt.doctorId } });
}

// ✅ Senior (1 single JOIN / eager load)
const appointments = await prisma.appointment.findMany({
  take: 50,
  include: { doctor: true, patient: true },
});
```

### B. Strategic Indexing
- **Composite Indexes**: When querying multiple fields together (`where: { doctorId: "123", status: "PENDING" }`), add a composite index in Prisma schema:
  ```prisma
  @@index([doctorId, status])
  ```
- **Order By Alignment**: Ensure indexed fields align with sorting (`orderBy: { createdAt: 'desc' }`).
- **Avoid Over-Indexing**: Indexes speed up reads (`SELECT`), but slow down writes (`INSERT`, `UPDATE`, `DELETE`). Index queries that run frequently on large tables.

### C. Select Only Needed Fields
Avoid fetching bulky columns (e.g. bio, full text history, images) when only a name or ID is needed:
```javascript
// ✅ Fetch only required projection
const doctors = await prisma.doctor.findMany({
  select: {
    id: true,
    name: true,
    specialization: true,
    avatarUrl: true,
  },
});
```

---

## 2. Frontend & React 19 / Next.js Optimization

### A. Server Components vs Client Components
- By default, keep components as **Server Components** (RSC).
- Only add `'use client'` when the component requires:
  - Event listeners (`onClick`, `onChange`)
  - State hooks (`useState`, `useReducer`, `useEffect`)
  - Browser-only APIs (`window`, `localStorage`, `navigator`)
- Push `'use client'` down to the leaves of the component tree to minimize client JavaScript bundle size.

### B. Avoiding Re-render Cascades
- Never create new functions or object literals inside heavy loops or deeply nested props without necessity.
- Use `useCallback` and `useMemo` where expensive computations or referential stability across child component renders are critical.
- Keep state local to where it is used. Avoid elevating transient state to the top-level app store.

### C. Asset & Image Optimization
- Always use `next/image` with explicit `width`, `height`, and appropriate `sizes` attribute.
- Specify `priority` only for the Largest Contentful Paint (LCP) hero image above the fold.
- Lazy load offscreen components with `dynamic(() => import(...), { ssr: false })` or React `Suspense`.

---

## 3. Caching Strategies

1. **In-Memory Cache (LRU)**:
   For static or rarely changing lookup tables (e.g., list of medical specializations, clinic locations), use in-memory LRU cache to save round-trips to the DB.
2. **HTTP Stale-While-Revalidate**:
   Use HTTP cache control headers (`Cache-Control: public, s-maxage=60, stale-while-revalidate=300`) on read-only public endpoints.
3. **Cache Invalidation**:
   When mutations occur, invalidate cache immediately via `revalidatePath(...)` or `revalidateTag(...)` in Next.js Server Actions.
