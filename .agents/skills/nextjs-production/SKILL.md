---
name: nextjs-production
description: >-
  Architect, build, optimize, and debug production-grade Next.js (App Router, Next.js 15+, React 19) applications.
  Use when designing Server Components (RSC) and Client Component boundaries, writing secure Server Actions,
  implementing caching and revalidation strategies (revalidatePath/revalidateTag), managing async request APIs (cookies, headers, params),
  optimizing Core Web Vitals (LCP, INP, CLS), configuring security headers, and deploying to production.
---

# Next.js Production Engineering Skill

This skill equips the agent with authoritative engineering standards for building, optimizing, securing, and maintaining enterprise-grade Next.js applications using the App Router, Next.js 15+, and React 19.

---

## 1. Core Production Mandates for Next.js 15+

1. **Server-First by Default**:
   - Keep components as React Server Components (RSC). Do not add `'use client'` unless browser APIs (`window`, `localStorage`), state (`useState`, `useReducer`), or DOM event listeners (`onClick`, `onChange`) are strictly required.
   - Push `'use client'` down to the leaf nodes of the component tree to prevent bloating the client JavaScript bundle.
2. **Next.js 15 Async Request APIs**:
   - `cookies()`, `headers()`, `params`, and `searchParams` are **asynchronous** in Next.js 15. Always `await` them before reading properties:
     ```javascript
     // Page component in Next.js 15
     export default async function Page({ params, searchParams }) {
       const { id } = await params;
       const { query } = await searchParams;
       // ...
     }
     ```
3. **Uncached by Default (Next.js 15)**:
   - `fetch` requests, `GET` route handlers, and client navigations are **uncached by default** in Next.js 15.
   - Apply explicit caching where appropriate using `next: { revalidate: X, tags: ['tag-name'] }` or `unstable_cache`.
4. **Hardened Server Actions**:
   - Validate every input payload with **Zod** at the action boundary.
   - Always verify authentication session and user authorization (ownership / RBAC) inside the action. Never trust client state.
   - **Never wrap `redirect()` inside a `try/catch` block** without re-throwing, because Next.js handles redirects by throwing a special internal error (`NEXT_REDIRECT`).
5. **Streaming & Non-Blocking Rendering**:
   - Wrap slow or asynchronous data fetches in `<Suspense fallback={<Skeleton />}>` or leverage `loading.jsx` so the initial UI shell renders instantly.
6. **Core Web Vitals & Asset Discipline**:
   - Always use `next/image` with explicit `width`, `height`, and responsive `sizes` attribute. Add `priority` exclusively to the above-the-fold hero image.
   - Lazy load heavy, non-critical client packages (e.g. chart libraries, PDF generators, canvas tools) using `next/dynamic` with `ssr: false`.

---

## 2. Architecture & File System Organization

```
app/
├── (auth)/                  # Isolated layout for signin/signup
├── (patient)/               # Authenticated patient portal routes
├── (admin)/                 # Role-gated administration panel
├── (public)/                # Public marketing and doctor directory
├── api/                     # Route handlers (webhooks, external integrations)
├── global-error.jsx         # Catch-all root error boundary
├── layout.jsx               # Root layout (fonts, providers, metadata)
├── not-found.jsx            # Custom 404 handler
└── sitemap.js               # Dynamic SEO sitemap generator
actions/                     # Encapsulated, Zod-validated Server Actions
components/
├── ui/                      # Primitive atomic components (buttons, dialogs, inputs)
├── layout/                  # Navigation bars, sidebars, footers
└── [domain]/                # Feature-specific components (e.g. appointments, doctor)
lib/                         # Database clients (Prisma), auth configs, utilities
```

---

## 3. Production Reference Library

- [Server Components & RSC Boundaries](./references/server-components-and-rsc-boundaries.md): Rules for composing RSC and Client Components, passing props, and avoiding serialization traps.
- [Server Actions & Mutation Security](./references/server-actions-and-mutations.md): Zod validation, auth gates, transactional mutations, optimistic UI, and the `redirect()` catch rule.
- [Caching & Revalidation in Next.js 15](./references/caching-and-revalidation-next15.md): Detailed mechanics of `revalidatePath`, `revalidateTag`, request deduplication, and cache tags.
- [Performance, Web Vitals & SEO](./references/performance-web-vitals-and-seo.md): Optimizing LCP/INP/CLS, dynamic imports, font optimization with `next/font`, and dynamic OpenGraph metadata.
- [Security Headers & Environment Validation](./references/security-headers-and-env-validation.md): CSP, HSTS, secure cookies, and strict runtime environment variable parsing.

---

## 4. Production Code Templates & Artifacts

- [Production Server Action Template](./examples/production-server-action-template.js): Production-ready Server Action with Zod validation, auth verification, and typed response.
- [Security Headers Next.js Config](./examples/next-config-security-headers.mjs): Hardened `next.config.mjs` snippet with full security headers.
- [Runtime Environment Validation Schema](./examples/env-validation-schema.js): Zod-based environment variable validator to prevent broken deployments.
