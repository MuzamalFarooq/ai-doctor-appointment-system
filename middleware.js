import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/doctors', '/about', '/contact', '/pricing', '/faq', '/privacy', '/privacy-policy', '/terms', '/blog'];
const AUTH_PATHS = ['/login', '/register', '/forgot-password'];

function getSafeCallbackUrl(request) {
  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
  if (!callbackUrl || !callbackUrl.startsWith('/') || callbackUrl.startsWith('//')) return null;

  const callbackPath = callbackUrl.split(/[?#]/, 1)[0];
  if (AUTH_PATHS.some(path => callbackPath.startsWith(path)) || callbackPath.startsWith('/auth/redirect')) {
    return null;
  }

  return callbackUrl;
}

function getRoleDestination(role) {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'DOCTOR') return '/doctor/dashboard';
  return '/healthcare';
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow static files, API auth routes, and public legal routes immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/webhooks') ||
    pathname === '/privacy' ||
    pathname === '/privacy-policy' ||
    pathname === '/terms' ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Get JWT token (Edge-safe, no Prisma)
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const isSecure = request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';

  let token = null;

  try {
    // 1. Try with auto/detected secureCookie flag
    token = await getToken({ req: request, secret, secureCookie: isSecure });

    // 2. Try opposite secureCookie flag if not found
    if (!token) {
      token = await getToken({ req: request, secret, secureCookie: !isSecure });
    }

    // 3. Fallbacks for Auth.js v5 and NextAuth v4 cookie variants
    if (!token) {
      token = await getToken({
        req: request,
        secret,
        cookieName: '__Secure-authjs.session-token',
        salt: '__Secure-authjs.session-token',
        secureCookie: true,
      });
    }
    if (!token) {
      token = await getToken({
        req: request,
        secret,
        cookieName: 'authjs.session-token',
        salt: 'authjs.session-token',
        secureCookie: false,
      });
    }
    if (!token) {
      token = await getToken({
        req: request,
        secret,
        cookieName: '__Secure-next-auth.session-token',
        salt: '__Secure-next-auth.session-token',
        secureCookie: true,
      });
    }
    if (!token) {
      token = await getToken({
        req: request,
        secret,
        cookieName: 'next-auth.session-token',
        salt: 'next-auth.session-token',
        secureCookie: false,
      });
    }
  } catch (err) {
    console.error('Middleware token extraction error:', err);
  }

  const isAuthenticated = !!token;
  const userRole = token?.role;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_PATHS.some(p => pathname.startsWith(p))) {
    const destination = getSafeCallbackUrl(request) || getRoleDestination(userRole);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Protect patient dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const callbackUrl = `${pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
    }
    if (userRole === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (userRole === 'DOCTOR') return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
  }

  // Protect doctor dashboard
  if (pathname === '/doctor' || pathname.startsWith('/doctor/')) {
    if (!isAuthenticated) {
      const callbackUrl = `${pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
    }
    if (userRole === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (userRole === 'PATIENT') return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect admin dashboard
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const callbackUrl = `${pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
    }
    if (userRole === 'DOCTOR') return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
    if (userRole === 'PATIENT') return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fevicon.jpg|favicon.jpg|public|images|icons|manifest.json).*)',
  ],
};
