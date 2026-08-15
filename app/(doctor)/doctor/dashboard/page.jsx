import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Users, DollarSign, Star, ArrowRight, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { DoctorEarningsChart } from '@/components/charts/EarningsChart';

export const metadata = { title: 'Doctor Dashboard' };

export default async function DoctorDashboardPage() {
  const session = await auth();
  const doctorId = session?.user?.doctorId;

  let doctor = null;
  let todaysAppointments = [];
  let recentReviews = [];
  let totalPatients = 0;

  if (doctorId) {
    try {
      [doctor, todaysAppointments, recentReviews] = await Promise.all([
        prisma.doctor.findUnique({ where: { id: doctorId } }),
        prisma.appointment.findMany({
          where: { doctorId, date: { gte: new Date(new Date().setHours(0,0,0,0)), lte: new Date(new Date().setHours(23,59,59,999)) } },
          include: { patient: { include: { user: { select: { name: true, image: true } } } } },
          orderBy: { startTime: 'asc' },
        }),
        prisma.review.findMany({
          where: { doctorId },
          include: { patient: { include: { user: { select: { name: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
      ]);
      const patients = await prisma.appointment.groupBy({
        by: ['patientId'],
        where: { doctorId },
      });
      totalPatients = patients.length;
    } catch {}
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Pending Approval Banner */}
      {doctor?.status === 'PENDING' && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Account Pending Approval</p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">Your doctor profile is under review. You&apos;ll be notified once approved by the admin team.</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black font-heading text-gray-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},
            <span className="gradient-text"> {session?.user?.name?.split(' ')[1] || session?.user?.name}!</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here&apos;s your overview for today</p>
        </div>
        <Link href="/doctor/availability" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm shadow-glow">
          Manage Availability
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Today's Patients" value={todaysAppointments.length} icon={Calendar} color="blue" />
        <StatCard title="Total Patients" value={totalPatients} icon={Users} color="green" change={5} />
        <StatCard title="Total Earnings" value={`PKR ${(doctor?.totalEarnings || 0).toLocaleString()}`} icon={DollarSign} color="purple" />
        <StatCard title="Rating" value={`${(doctor?.rating || 0).toFixed(1)} ★`} icon={Star} color="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 dark:text-white">Today&apos;s Appointments</h2>
            <Link href="/doctor/appointments" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {todaysAppointments.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysAppointments.map(apt => (
                <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-2 min-w-[3.5rem] border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400">Time</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{apt.startTime}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{apt.patient?.user?.name}</p>
                    <p className="text-xs text-gray-400">{apt.reason || 'General consultation'}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5">Recent Reviews</h2>
          {recentReviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.patient?.user?.name}</p>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-600'}`} />)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <DoctorEarningsChart />
      </div>
    </div>
  );
}
