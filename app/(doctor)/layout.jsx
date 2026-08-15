import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DoctorSidebar } from '@/components/dashboard/DoctorSidebar';

export const metadata = {
  title: { default: 'Doctor Dashboard', template: '%s | Doctor — MediConnect AI' },
};

export default async function DoctorLayout({ children }) {
  const session = await auth();
  if (!session || session.user.role !== 'DOCTOR') redirect('/login');

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <DoctorSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
