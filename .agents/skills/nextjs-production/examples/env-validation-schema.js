/**
 * Production Runtime Environment Variable Validation
 * Place in lib/env.js and import across server utilities
 */
import { z } from 'zod';

const envSchema = z.object({
  // Database Connection
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid postgres/mysql URL'),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET must be at least 16 characters'),
  NEXTAUTH_URL: z.string().url().optional(),

  // Third-party Integrations
  OPENAI_API_KEY: z.string().startsWith('sk-', 'Must be a valid OpenAI API key').optional(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Must be a valid Stripe secret key').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Must be a valid Stripe webhook secret').optional(),
  RESEND_API_KEY: z.string().startsWith('re_', 'Must be a valid Resend API key').optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Environment mode
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ CRITICAL: Invalid environment variables detected:');
  console.error(JSON.stringify(_env.error.flatten().fieldErrors, null, 2));
  throw new Error('Invalid environment configuration. Aborting process startup.');
}

export const env = _env.data;
