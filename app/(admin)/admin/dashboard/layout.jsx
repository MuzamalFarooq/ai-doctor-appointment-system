import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';

export default function AdminDashboardLayout({ children }) {
  return children;
}
