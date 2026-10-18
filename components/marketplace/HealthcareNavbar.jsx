'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { CalendarDays, ChevronDown, Menu, Stethoscope, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

const links = [
  { href: '/healthcare', label: 'Home' },
  { href: '/doctors', label: 'Find Doctors' },
  { href: '/medicines', label: 'Medicines' },
  { href: '/lab-tests', label: 'Lab Tests' },
  { href: '/surgery', label: 'Surgery' },
  { href: '/healthcare#services', label: 'Health Services' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

function getAccountLinks(role) {
  if (role === 'ADMIN') return [{ href: '/admin/dashboard', label: 'Admin panel' }];
  if (role === 'DOCTOR') return [{ href: '/doctor/dashboard', label: 'Doctor dashboard' }];
  return [
    { href: '/dashboard/profile', label: 'My profile' },
    { href: '/dashboard/appointments', label: 'My appointments' },
    { href: '/dashboard/prescriptions', label: 'My prescriptions' },
    { href: '/dashboard/notifications', label: 'Notifications' },
  ];
}

function isActiveLink(pathname, href) {
  const path = href.split('#')[0];
  if (href.includes('#')) return false;
  if (path === '/healthcare') return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function HealthcareNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const accountLinks = getAccountLinks(session?.user?.role);

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur"
      onKeyDown={event => {
        if (event.key === 'Escape') {
          setMobileOpen(false);
          setProfileOpen(false);
        }
      }}
    >
      <nav aria-label="Main navigation" className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/healthcare" className="flex shrink-0 items-center gap-2.5" aria-label="MediConnect AI home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            MediConnect <span className="text-teal-700">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 xl:flex">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActiveLink(pathname, link.href) ? 'page' : undefined}
              className={`rounded-lg px-2.5 py-2 text-xs font-medium transition-colors 2xl:px-3 2xl:text-sm ${
                isActiveLink(pathname, link.href)
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-teal-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          {session ? (
            <>
              {session.user?.role === 'PATIENT' && (
                <Link href="/dashboard/appointments" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <CalendarDays className="h-4 w-4 text-teal-700" />
                  <span className="hidden 2xl:inline">Appointments</span>
                </Link>
              )}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-controls="healthcare-profile-menu"
                  aria-label={profileOpen ? 'Close profile menu' : 'Open profile menu'}
                  onClick={() => setProfileOpen(open => !open)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-2.5 hover:bg-slate-50"
                >
                  <Avatar src={session.user?.image} name={session.user?.name} size="sm" />
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
                {profileOpen && (
                  <>
                    <button className="fixed inset-0 z-10 cursor-default" aria-label="Close profile menu" onClick={() => setProfileOpen(false)} />
                    <div id="healthcare-profile-menu" role="menu" className="absolute right-0 top-12 z-20 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                      <p className="truncate px-3 py-2 text-sm font-semibold text-slate-900">{session.user?.name}</p>
                      {accountLinks.map(item => (
                        <Link key={item.href} href={item.href} role="menuitem" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-800">
                          {item.label}
                        </Link>
                      ))}
                      <button role="menuitem" onClick={() => signOut({ callbackUrl: '/' })} className="mt-1 w-full rounded-lg border-t border-slate-100 px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50">
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-teal-800">Log in</Link>
              <Link href="/register" className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800">Sign up</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 xl:hidden"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(open => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 shadow-lg xl:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-1 sm:grid-cols-4">
            {links.map(link => {
              const active = isActiveLink(pathname, link.href);
              return (
                <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} onClick={() => setMobileOpen(false)} className={`rounded-lg px-3 py-2.5 text-sm font-medium ${active ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-800'}`}>
                  {link.label}
                </Link>
              );
            })}
            {session ? accountLinks.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-teal-800 hover:bg-teal-50">
                {item.label}
              </Link>
            )) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50">Log in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50">Sign up</Link>
              </>
            )}
          </div>
          {session && <button onClick={() => signOut({ callbackUrl: '/' })} className="mt-2 w-full rounded-lg border-t border-slate-100 px-3 py-3 text-left text-sm text-rose-700">Sign out</button>}
        </div>
      )}
    </header>
  );
}
