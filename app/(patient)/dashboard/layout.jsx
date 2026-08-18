import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PatientSidebar } from '@/components/dashboard/PatientSidebar';

export default function PatientDashboardLayout({ children }) {
  return children;
}
