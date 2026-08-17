import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Calendar, CheckCircle, Clock, CreditCard, ArrowRight,
  Brain, FileText, Activity, AlertCircle, Plus
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

export const metadata = { title: 'Patient Dashboard' };

async function getPatientData(patientId) {
  const [appointments, payments] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId },
      include: { doctor: { include: { user: { select: { name: true } } } } },
      orderBy: { date: 'desc' },
      take: 20,
    }),
    prisma.payment.findMany({
      where: { patientId, status: 'PENDING' },
    }),
  ]);
  return { appointments, pendingPayments: payments.length };
}

export default async function PatientDashboardPage() {
  const session = await auth();
  const patientId = session?.user?.patientId;
  
  let data = { appointments: [], pendingPayments: 0 };
  if (patientId) {
    try { data = await getPatientData(patientId); } catch {}
  }

  const total = data.appointments.length;
  const upcoming = data.appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const completed = data.appointments.filter(a => a.status === 'COMPLETED').length;
  const nextAppointments = upcoming.slice(0, 3);

  const quickActions = [
    { href: '/doctors', icon: Calendar, label: 'Book Appointment', color: 'from-primary-600 to-primary-700', desc: 'Find & book a doctor' },
    { href: '/ai-symptom-checker', icon: Brain, label: 'AI Symptom Check', color: 'from-accent-600 to-accent-700', desc: 'Get AI recommendations' },
    { href: '/dashboard/prescriptions', icon: FileText, label: 'Prescriptions', color: 'from-emerald-600 to-teal-600', desc: 'View & download' },
    { href: '/dashboard/medical-history', icon: Activity, label: 'Health Records', color: 'from-orange-600 to-amber-600', desc: 'Medical history' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black font-heading text-gray-900 dark:text-white">
            Welcome back, <span className="gradient-text">{session?.user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/doctors" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm shadow-glow">
          <Plus className="w-4 h-4" /> Book Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 md:mb-10">
        <StatCard title="Total Appointments" value={total} icon={Calendar} color="blue" change={12} changeLabel="this month" />
        <StatCard title="Upcoming" value={upcoming.length} icon={Clock} color="orange" />
        <StatCard title="Completed" value={completed} icon={CheckCircle} color="green" change={8} />
        <StatCard title="Pending Payments" value={data.pendingPayments} icon={CreditCard} color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 dark:text-white">Upcoming Appointments</h2>
            <Link href="/dashboard/appointments" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {nextAppointments.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">No upcoming appointments</p>
              <Link href="/doctors" className="text-xs bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors">
                Book your first appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {nextAppointments.map(apt => (
                <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors">
                  <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-2 min-w-[3rem] border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400">{formatDate(apt.date, 'MMM')}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(apt.date, 'd')}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{apt.doctor?.user?.name}</p>
                    <p className="text-xs text-gray-400">{apt.doctor?.specialization} • {apt.startTime}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3.5">
          <h2 className="font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          {quickActions.map(({ href, icon: Icon, label, color, desc }) => (
            <Link key={href} href={href}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
