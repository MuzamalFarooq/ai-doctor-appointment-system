import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { DollarSign, CreditCard, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Earnings & Payouts | Doctor Dashboard',
};

export default async function DoctorEarningsPage() {
  const session = await auth();
  if (!session) return null;

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  });

  const payments = doctor
    ? await prisma.payment.findMany({
        where: { appointment: { doctorId: doctor.id } },
        include: {
          appointment: {
            include: {
              patient: {
                include: { user: { select: { name: true, email: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const totalEarnings = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingEarnings = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
          Earnings & Financials
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Detailed breakdown of consultation revenue and payment transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-heading">
            PKR {totalEarnings.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Clearance</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-heading">
            PKR {pendingEarnings.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consultation Fee</span>
            <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-heading">
            PKR {doctor?.consultationFee?.toLocaleString() || '1,000'}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
          <span className="text-xs text-gray-400">{payments.length} total</span>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No payment transactions found</p>
            <p className="text-xs text-gray-400 mt-1">Payment records for booked visits will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {payments.map((p) => (
              <div key={p.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {p.appointment?.patient?.user?.name || 'Patient Consultation'}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(p.createdAt), 'MMM dd, yyyy • hh:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                    PKR {p.amount?.toLocaleString()}
                  </p>
                  <Badge variant={p.status === 'PAID' ? 'success' : 'warning'} className="mt-1">
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
