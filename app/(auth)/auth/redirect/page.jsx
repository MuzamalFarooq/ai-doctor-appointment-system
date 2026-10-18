import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

function safeCallbackUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
  const path = value.split(/[?#]/, 1)[0];
  if (['/login', '/register', '/forgot-password', '/reset-password', '/auth/redirect'].some(route => path.startsWith(route))) {
    return null;
  }
  return value;
}

export default async function AuthRedirectPage({ searchParams }) {
  const [{ callbackUrl }, session] = await Promise.all([searchParams, auth()]);
  if (!session) redirect('/login');

  const intendedDestination = safeCallbackUrl(callbackUrl);
  if (intendedDestination) redirect(intendedDestination);
  if (session.user?.role === 'ADMIN') redirect('/admin/dashboard');
  if (session.user?.role === 'DOCTOR') redirect('/doctor/dashboard');
  redirect('/healthcare');
}
