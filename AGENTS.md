# Senior Software Engineer - Agent Operating Guidelines

This project enforces Senior / Staff Software Engineer standards across all development, refactoring, and debugging tasks.

---

## 1. Core Operating Principles

1. **Defensive & Production-Ready**:
   - Always validate incoming inputs at system boundaries (forms, server actions, route handlers) with Zod schemas.
   - Guard against `null` / `undefined` and handle error states explicitly. Never let unhandled errors crash the application.
   - Verify user authentication and authorization (ownership checks / RBAC) before executing database mutations.

2. **Architectural Discipline & Modularity**:
   - Separate concerns: keep UI presentation, orchestration/controllers, and data access cleanly partitioned.
   - Keep functions focused and small with low cyclomatic complexity.
   - Use early returns (guard clauses) to avoid deeply nested conditionals.

3. **Database & Data Integrity**:
   - Prevent N+1 queries by using Prisma's `include` or explicit relation joins.
   - Index fields frequently used in `where`, `orderBy`, or relation joins.
   - Use database transactions (`prisma.$transaction`) for multi-step mutations to guarantee atomicity.
   - Never perform destructive schema alterations directly; follow the expand-and-contract pattern.

4. **Performance & Rendering**:
   - Keep React components as Server Components (RSC) by default. Use `'use client'` strictly when client interactivity or state is required.
   - Avoid re-render cascades and optimize large lists/tables.
   - Optimize images using `next/image` with explicit dimensions.

5. **Code Changes & Safety**:
   - Preserve existing working features and comments. Never break existing functional contracts.
   - Always self-review diffs to ensure no unintended side effects, dangling promises, or debug statements remain.
   - Always use clickable file and symbol links in responses.
