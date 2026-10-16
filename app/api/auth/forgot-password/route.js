import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validators';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/resend';
import { checkPersistentRateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GENERIC_RESPONSE = {
  success: true,
  message: 'If an account exists for this email, password reset instructions will be sent.',
};

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);

    // 1. IP-level rate limit: max 5 requests per 15 minutes per IP
    const ipLimit = await checkPersistentRateLimit({
      key: `forgot-pw:ip:${clientIp}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!ipLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    // 2. Validate request body
    const body = await request.json().catch(() => null);
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid email address.' },
        { status: 400 }
      );
    }

    const email = validation.data.email.toLowerCase().trim();

    // 3. Email-level rate limit: max 3 requests per 15 minutes per email
    const emailLimit = await checkPersistentRateLimit({
      key: `forgot-pw:email:${email}`,
      limit: 3,
      windowMs: 15 * 60 * 1000,
    });

    if (!emailLimit.success) {
      return NextResponse.json(
        { error: 'Too many reset requests for this email. Please try again later.' },
        { status: 429 }
      );
    }

    // 4. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, isActive: true },
    });

    // If user does not exist or is inactive, return identical generic response (prevent enumeration)
    if (!user || user.isActive === false) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    // 5. Invalidate any outstanding tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // 6. Generate 256-bit token & SHA-256 hash (30 minutes expiry)
    const { token, tokenHash, expiresAt } = generatePasswordResetToken();

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // 7. Construct secure reset URL from trusted environment variable (NEVER untrusted Host header)
    const trustedAppUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'https://mediconnect.muzamal.site';
    const baseUrl = trustedAppUrl.replace(/\/+$/, '');
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    // 8. Send branded reset email asynchronously
    // Wrapped safely so email failures never crash or leak user existence
    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        userName: user.name,
      });
    } catch (emailErr) {
      console.error('Password reset email dispatch error:', {
        code: emailErr?.code || 'EMAIL_DISPATCH_FAILED',
      });
    }

    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  } catch (err) {
    console.error('Forgot password processing error:', {
      name: err instanceof Error ? err.name : 'UnknownError',
    });
    // Return generic error without leaking internals
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
