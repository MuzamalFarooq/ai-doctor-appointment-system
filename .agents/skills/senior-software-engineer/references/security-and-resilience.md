# Security & Resilience Guide

A Senior Engineer assumes zero trust in client requests, defends against the OWASP Top 10 vulnerabilities, and architects systems that fail gracefully under duress.

---

## 1. Authentication & Authorization Boundaries

### Authentication vs. Authorization
- **Authentication**: Verifying *who* the user is (session cookie, JWT, OAuth token).
- **Authorization**: Verifying *what* the user is permitted to do (RBAC, ABAC, row-level ownership).

### The Insecure Direct Object Reference (IDOR) Trap
Never trust an ID from the client without verifying ownership:
```javascript
// ❌ Dangerous (IDOR): Any logged-in user can view/delete any appointment by guessing the ID
export async function getAppointment(id) {
  return await prisma.appointment.findUnique({ where: { id } });
}

// ✅ Senior Secure: Verify tenant / user ownership
export async function getAppointment(id, sessionUserId, userRole) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { doctor: true, patient: true },
  });

  if (!appointment) return null;

  const isOwner = appointment.patientId === sessionUserId || appointment.doctorId === sessionUserId;
  const isAdmin = userRole === "ADMIN";

  if (!isOwner && !isAdmin) {
    throw new Error("Forbidden: You do not have access to this record");
  }

  return appointment;
}
```

---

## 2. Input Sanitization & Injection Defense

1. **SQL Injection**:
   - Always use parameterized queries or type-safe ORM methods (`prisma.user.findFirst(...)`).
   - If raw SQL is required (`$queryRaw`), strictly use template string parameterization: `prisma.$queryRaw` (NEVER string concatenation or `${userInput}`).
2. **Cross-Site Scripting (XSS)**:
   - Avoid `dangerouslySetInnerHTML`. If HTML rendering is mandatory (e.g. blog post editor), sanitize with a trusted sanitizer (DOMPurify).
   - Enforce Content Security Policy (CSP) headers in `next.config.mjs`.
3. **Mass Assignment Prevention**:
   - Never pass `req.body` directly to database creation/updates (`prisma.user.update({ data: req.body })`).
   - Validate and whitelist fields explicitly via Zod:
     ```javascript
     const UpdateProfileSchema = z.object({
       name: z.string().min(2).max(100),
       phone: z.string().optional(),
     });
     const cleanData = UpdateProfileSchema.parse(rawData);
     await prisma.user.update({ where: { id }, data: cleanData });
     ```

---

## 3. Rate Limiting & Denial of Service (DoS) Defense

- **Rate Limit High-Risk Routes**:
  - Login / Authentication / OTP endpoints (mitigate brute force attacks).
  - Password reset endpoints.
  - AI generation / OpenAI endpoints (prevent wallet draining).
  - Public booking endpoints (prevent slot exhaustion).
- **Use Token Bucket / Sliding Window**:
  - Implement rate limiting with Upstash Redis or LRU-cache in middleware.

---

## 4. Resilience & Circuit Breakers

1. **Graceful Degradation**:
   - If an external integration fails (e.g. OpenAI service is down, or email delivery fails via Resend), the core system must not crash. Log the error, queue a background retry, and return a clean user experience.
2. **Database Connection Safety**:
   - Use Prisma connection pooling or serverless connection proxies (e.g., PgBouncer / Neon connection string with `?pgbouncer=true` or pooled endpoint).
   - Always disconnect or manage pool exhaustion gracefully.
3. **Structured Logging**:
   - Never log sensitive credentials, passwords, tokens, full credit card numbers, or PII (Personally Identifiable Information).
   - Include correlation IDs in logs so requests can be traced end-to-end.
