import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';

export default async function AdminDashboardLayout({ children }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar user={session.user} />
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
