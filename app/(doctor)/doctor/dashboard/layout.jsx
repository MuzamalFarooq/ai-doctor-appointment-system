import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DoctorSidebar } from '@/components/dashboard/DoctorSidebar';

export default function DoctorDashboardLayout({ children }) {
  return children;
}
