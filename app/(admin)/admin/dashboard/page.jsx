import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, UserCog, Calendar, DollarSign, ArrowRight, Shield, CheckCircle, XCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { approveDoctor, rejectDoctor } from '@/actions/doctor.actions';
import { revalidatePath } from 'next/cache';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';
import { AdminRevenueChart } from '@/components/charts/RevenueChart';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const session = await auth();

  let stats = { users: 0, doctors: 0, appointments: 0, revenue: 0 };
  let pendingDoctors = [];
  let recentAppointments = [];

  try {
    const [usersCount, doctorsCount, appointmentsCount, revenueSum, pending, appointments] = await Promise.all([
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.doctor.count({ where: { status: 'APPROVED' } }),
      prisma.appointment.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
      prisma.doctor.findMany({ 
        where: { status: 'PENDING' },
        include: { user: { select: { name: true, email: true, image: true } } },
        take: 5 
      }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { 
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } } } }
        }
      })
    ]);
    stats = {
      users: usersCount,
      doctors: doctorsCount,
      appointments: appointmentsCount,
      revenue: revenueSum._sum.amount || 0
    };
    pendingDoctors = pending;
    recentAppointments = appointments;
  } catch (error) {
    console.error('Error fetching admin dashboard data', error);
  }

  async function handleApproveDoctor(formData) {
    'use server';
    await approveDoctor(formData.get('doctorId'));
    revalidatePath('/admin/dashboard');
  }

  async function handleRejectDoctor(formData) {
    'use server';
    await rejectDoctor(formData.get('doctorId'));
    revalidatePath('/admin/dashboard');
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-heading text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">System overview and quick actions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={stats.users} icon={Users} color="blue" />
        <StatCard title="Approved Doctors" value={stats.doctors} icon={UserCog} color="green" />
        <StatCard title="Total Appointments" value={stats.appointments} icon={Calendar} color="purple" />
        <StatCard title="Total Revenue" value={`PKR ${stats.revenue.toLocaleString()}`} icon={DollarSign} color="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Revenue Overview</h2>
            <AdminRevenueChart />
          </div>

          {/* Recent Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
             <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">Recent Appointments</h2>
              <Link href="/admin/appointments" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Patient</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map(apt => (
                    <tr key={apt.id} className="border-b border-gray-50 dark:border-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{apt.patient?.user?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{apt.doctor?.user?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(apt.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          apt.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 
                          apt.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : 
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentAppointments.length === 0 && <p className="text-center text-gray-500 py-4">No recent appointments</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Pending Approvals */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" /> Pending Approvals
              </h2>
              {pendingDoctors.length > 0 && <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">{pendingDoctors.length}</span>}
            </div>
            
            <div className="space-y-4">
              {pendingDoctors.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-gray-500">No pending approvals</p>
                </div>
              ) : (
                pendingDoctors.map(doctor => (
                  <div key={doctor.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar src={doctor.user?.image} name={doctor.user?.name} size="sm" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{doctor.user?.name}</p>
                        <p className="text-xs text-gray-500">{doctor.specialization}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <form action={handleApproveDoctor} className="flex-1">
                        <input type="hidden" name="doctorId" value={doctor.id} />
                        <button type="submit" className="w-full py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-lg flex items-center justify-center gap-1 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                      </form>
                      <form action={handleRejectDoctor} className="flex-1">
                        <input type="hidden" name="doctorId" value={doctor.id} />
                        <button type="submit" className="w-full py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded-lg flex items-center justify-center gap-1 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
