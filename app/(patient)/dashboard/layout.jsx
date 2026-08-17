import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PatientSidebar } from '@/components/dashboard/PatientSidebar';

export default async function PatientDashboardLayout({ children }) {
  const session = await auth();
  if (!session || session.user.role !== 'PATIENT') redirect('/login');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PatientSidebar user={session.user} />
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14">{children}</div>
      </main>
    </div>
  );
}
