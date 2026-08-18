import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PatientSidebar } from '@/components/dashboard/PatientSidebar';

export const metadata = {
  title: { default: 'Patient Dashboard', template: '%s | Dashboard — MediConnect AI' },
};

export default async function PatientLayout({ children }) {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user?.role === 'ADMIN') redirect('/admin/dashboard');
  if (session.user?.role === 'DOCTOR') redirect('/doctor/dashboard');

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <PatientSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
