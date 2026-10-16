import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validators';
import { hashResetToken } from '@/lib/tokens';
import { sendPasswordResetSuccessEmail } from '@/lib/resend';
import { checkPersistentRateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET: Safe read-only token validity check.
 * NEVER changes passwords or mutates data via GET.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        { valid: false, error: 'Reset token is missing or malformed.' },
        { status: 400 }
      );
    }

    const tokenHash = hashResetToken(token);
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { expiresAt: true },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Reset link has expired or is invalid.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (err) {
    console.error('Reset token verification error:', {
      name: err instanceof Error ? err.name : 'UnknownError',
    });
    return NextResponse.json(
      { valid: false, error: 'Unable to verify token at this time.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Secure atomic password reset.
 */
export async function POST(request) {
  try {
    const clientIp = getClientIp(request);

    // 1. IP-level rate limit for reset attempts: max 10 requests per 15 min
    const ipLimit = await checkPersistentRateLimit({
      key: `reset-pw:ip:${clientIp}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!ipLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    // 2. Validate input
    const body = await request.json().catch(() => null);
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input provided.' },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // 3. Hash submitted token
    let tokenHash;
    try {
      tokenHash = hashResetToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token format.' },
        { status: 400 }
      );
    }

    // 4. Rate limit by token hash to prevent token brute force
    const tokenLimit = await checkPersistentRateLimit({
      key: `reset-pw:token:${tokenHash.slice(0, 16)}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!tokenLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts for this reset link. Please request a new one.' },
        { status: 429 }
      );
    }

    // 5. Look up token in database
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    // Check validity & expiration
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (!tokenRecord.user || tokenRecord.user.isActive === false) {
      return NextResponse.json(
        { error: 'This user account is inactive or not found.' },
        { status: 400 }
      );
    }

    // 6. Hash new password using existing bcrypt standard (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = tokenRecord.userId;
    const userEmail = tokenRecord.user.email;
    const userName = tokenRecord.user.name;

    // 7. Atomic transaction: consume token, update password, invalidate any other tokens
    // Concurrent requests trying to consume the same token will fail at delete(where: { id })
    try {
      await prisma.$transaction([
        // Single-use token consumption
        prisma.passwordResetToken.delete({
          where: { id: tokenRecord.id },
        }),
        // Update password and record timestamp
        prisma.user.update({
          where: { id: userId },
          data: {
            password: hashedPassword,
            passwordChangedAt: new Date(),
          },
        }),
        // Invalidate any other outstanding reset tokens for this user
        prisma.passwordResetToken.deleteMany({
          where: { userId },
        }),
      ]);
    } catch (txError) {
      // P2025: Record to delete does not exist (already consumed by concurrent request)
      console.warn('Atomic reset transaction conflict or token already consumed:', {
        code: txError?.code || 'UNKNOWN',
      });
      return NextResponse.json(
        { error: 'This reset token has already been used or is no longer valid.' },
        { status: 400 }
      );
    }

    // 8. Revoke existing sessions by expiring session cookies in response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Your password has been reset successfully. Please sign in with your new password.',
      },
      { status: 200 }
    );

    const sessionCookieNames = [
      'authjs.session-token',
      '__Secure-authjs.session-token',
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
    ];

    sessionCookieNames.forEach((name) => {
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
    });

    // 9. Send confirmation email (safe background execution)
    sendPasswordResetSuccessEmail({
      to: userEmail,
      userName,
    }).catch((emailErr) => {
      console.error('Password reset confirmation email failed to send:', {
        code: emailErr?.code || 'CONFIRM_EMAIL_FAILED',
      });
    });

    return response;
  } catch (err) {
    console.error('Reset password processing error:', {
      name: err instanceof Error ? err.name : 'UnknownError',
    });
    return NextResponse.json(
      { error: 'An unexpected error occurred while resetting your password. Please try again.' },
      { status: 500 }
    );
  }
}
