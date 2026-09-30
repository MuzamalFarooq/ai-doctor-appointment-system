# Security Headers & Environment Validation Guide

Production deployments require defense against malicious iframe embedding, clickjacking, protocol downgrades, and misconfigured environment variables.

---

## 1. Production Security Headers

Configure HTTP security headers directly in `next.config.mjs`:

```javascript
// next.config.mjs
const securityHeaders = [
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME-sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Enforce HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Restrict browser features (camera, microphone, geolocation)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By: Next.js to reduce information leakage
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

---

## 2. Fail-Fast Runtime Environment Validation

Prevent cryptic production crashes by validating all environment variables at startup using a typed Zod schema:

```javascript
// lib/env.js
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET must be at least 16 characters'),
  NEXTAUTH_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().startsWith('sk-', 'Invalid OpenAI API key format').optional(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key').optional(),
  RESEND_API_KEY: z.string().startsWith('re_', 'Invalid Resend API key').optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid or missing environment variables:');
  console.error(_env.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration. Aborting deployment.');
}

export const env = _env.data;
```

---

## 3. Server-Only Protection

Prevent accidental leakage of server-side secrets or database utilities into Client Components:

```bash
npm install server-only
```

```javascript
// lib/prisma.js or lib/stripe.js
import 'server-only';
import { PrismaClient } from '@prisma/client';

// If any client component imports this file, the build will immediately fail!
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
export default prisma;
```
