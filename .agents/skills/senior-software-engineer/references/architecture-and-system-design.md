# System Design & Architecture Guide

A Senior Software Engineer designs software systems that are modular, decoupled, testable, and prepared for organic growth without premature over-engineering.

---

## 1. Core Architectural Principles

### Separation of Concerns & Layered Architecture
Keep business logic strictly isolated from the delivery mechanism (UI / HTTP / Framework controllers) and data access layers:

```
┌────────────────────────────────────────────────────────┐
│ Presentation Layer (React Components / Pages / UI)     │
└──────────────────────────┬─────────────────────────────┘
                           │ (Calls actions / handlers)
┌──────────────────────────▼─────────────────────────────┐
│ Application / Controller Layer (Validation, Auth guard)│
└──────────────────────────┬─────────────────────────────┘
                           │ (Invokes domain services)
┌──────────────────────────▼─────────────────────────────┐
│ Domain / Business Logic (Pure rules, calculations)    │
└──────────────────────────┬─────────────────────────────┘
                           │ (Queries database / 3rd party)
┌──────────────────────────▼─────────────────────────────┐
│ Data Access Layer (Prisma / ORM / Repositories / APIs) │
└────────────────────────────────────────────────────────┘
```

#### Why This Matters:
- Framework updates (e.g. Next.js upgrades, React 18 -> 19) should not break your core business calculations.
- Swapping a payment gateway (e.g. Stripe to another provider) or database engine touches only the data adapter, never the UI or core logic.

---

## 2. API Contract & Data Validation Design

1. **Schema Validation at the Boundary**:
   - Every incoming request must be validated with a strict schema validator like **Zod**.
   - Strip unknown fields (`.strict()` or default stripping) to prevent mass-assignment vulnerabilities.
2. **Predictable Response Envelopes**:
   Standardize responses across all server actions and API endpoints:
   ```typescript
   type ApiResponse<T> = 
     | { success: true; data: T; message?: string }
     | { success: false; error: string; code?: string; details?: unknown };
   ```
3. **HTTP Semantics & Idempotency**:
   - `GET`: Safe, idempotent, cacheable. No mutations.
   - `POST`: Non-idempotent resource creation. Use idempotency keys for critical workflows (charges, bookings).
   - `PUT / PATCH`: Idempotent full/partial replacement.
   - `DELETE`: Idempotent removal.

---

## 3. Database & Data Modeling Best Practices

- **Normalize First, Denormalize Deliberately**:
  Start with 3rd Normal Form (3NF). Only denormalize when read-performance profiling proves an unacceptable latency bottleneck.
- **Foreign Key Constraints & Cascades**:
  Always define foreign key constraints. Be explicit about `onDelete: Cascade` vs `onDelete: Restrict` (e.g., deleting a User should never silently delete paid Invoices or medical records).
- **Soft Deletes vs Hard Deletes**:
  Critical medical, financial, and compliance entities should use soft deletes (`deletedAt DateTime?`) and audit logging rather than permanent deletion.
- **Index Foreign Keys**:
  Every field involved in `JOIN`, `WHERE`, or `ORDER BY` clauses must have an index. Unindexed foreign keys cause slow table scans.

---

## 4. State Management Strategy

1. **Server State vs Client State**:
   - **Server State** (database records, user profile, appointments): Cache using server cache, TanStack Query, or Next.js fetch cache. Do NOT duplicate server state in global client stores unless necessary.
   - **Client State** (modal visibility, form step, UI themes): Use Zustand, React Context, or local component state (`useState`).
   - **URL State** (filters, search queries, pagination, active tabs): Keep in URL search params (`?page=2&status=confirmed`). This ensures shareability, bookmarking, and native browser back/forward support.
