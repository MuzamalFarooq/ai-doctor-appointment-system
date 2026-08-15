import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/doctors', '/about', '/contact', '/pricing', '/faq', '/privacy-policy', '/terms', '/blog'];
const AUTH_PATHS = ['/login', '/register', '/forgot-password'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow static files and API auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Get JWT token (Edge-safe, no Prisma)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userRole = token?.role;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_PATHS.some(p => pathname.startsWith(p))) {
    if (userRole === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (userRole === 'DOCTOR') return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect patient dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url));
    if (userRole !== 'PATIENT') return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect doctor dashboard
  if (pathname.startsWith('/doctor')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url));
    if (userRole !== 'DOCTOR') return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect admin dashboard
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url));
    if (userRole !== 'ADMIN') return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|images|icons|manifest.json).*)',
  ],
};
