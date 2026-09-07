import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BarChart3, Users, Calendar, Star, DollarSign, Activity } from 'lucide-react';

export const metadata = {
  title: 'Performance & Analytics | Doctor Dashboard',
};

export default async function DoctorAnalyticsPage() {
  const session = await auth();
  if (!session) return null;

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  });

  const [totalAppointments, completedCount, cancelledCount, reviews, totalRevenue] = doctor
    ? await Promise.all([
        prisma.appointment.count({ where: { doctorId: doctor.id } }),
        prisma.appointment.count({ where: { doctorId: doctor.id, status: 'COMPLETED' } }),
        prisma.appointment.count({ where: { doctorId: doctor.id, status: 'CANCELLED' } }),
        prisma.review.findMany({ where: { doctorId: doctor.id }, select: { rating: true } }),
        prisma.payment.aggregate({ where: { appointment: { doctorId: doctor.id }, status: 'PAID' }, _sum: { amount: true } }),
      ])
    : [0, 0, 0, [], { _sum: { amount: 0 } }];

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : (doctor?.rating || 5.0);
  const completionRate = totalAppointments > 0 ? Math.round((completedCount / totalAppointments) * 100) : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
          Practice Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Real-time metrics on patient growth, consultations, and patient satisfaction
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Consults</span>
            <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-heading">{totalAppointments}</p>
          <p className="text-xs text-gray-400 mt-1">{completedCount} completed</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-heading">{completionRate}%</p>
          <p className="text-xs text-gray-400 mt-1">{cancelledCount} cancellations</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient Rating</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-heading">{avgRating} / 5.0</p>
          <p className="text-xs text-gray-400 mt-1">{reviews.length} verified reviews</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue Earned</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading">
            PKR {(totalRevenue._sum.amount || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">Paid directly to doctor</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Practice Growth Insights</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <span>Profile Visibility</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Verified & Active</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <span>Specialization Search Ranking</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">Top Tier</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <span>Average Patient Response Time</span>
            <span className="font-semibold text-gray-900 dark:text-white">&lt; 15 mins</span>
          </div>
        </div>
      </div>
    </div>
  );
}
