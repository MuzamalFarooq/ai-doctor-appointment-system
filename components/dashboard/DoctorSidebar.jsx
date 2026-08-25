'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Calendar, Users, FileText, Clock,
  DollarSign, BarChart3, MessageSquare, User, LogOut, Menu, X,
  Stethoscope, ChevronRight, Shield
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/doctor/appointments', label: 'Appointments', icon: Calendar },
  { href: '/doctor/calendar', label: 'Calendar', icon: Calendar },
  { href: '/doctor/patients', label: 'Patients', icon: Users },
  { href: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
  { href: '/doctor/availability', label: 'Availability', icon: Clock },
  { href: '/doctor/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/doctor/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/doctor/chat', label: 'Messages', icon: MessageSquare },
  { href: '/doctor/profile', label: 'Profile', icon: User },
];

function DoctorSidebarContent({ user, pathname, onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <span className="font-heading font-bold text-gray-900 dark:text-white">MediConnect</span>
      </div>
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/50 dark:to-accent-950/50">
          <Avatar src={user?.image} name={user?.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <Badge variant="primary">Doctor</Badge>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={onNavigate}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100')}>
              <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-primary-600 dark:text-primary-400')} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-primary-400" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

export function DoctorSidebar({ user }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-30">
        <DoctorSidebarContent user={user} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </aside>
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center"><Stethoscope className="w-4 h-4 text-white" /></div>
          <span className="font-heading font-bold text-gray-900 dark:text-white">MediConnect</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><Menu className="w-5 h-5" /></button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-white dark:bg-gray-900 h-full overflow-y-auto">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            <DoctorSidebarContent user={user} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
