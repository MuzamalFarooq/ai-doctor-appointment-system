'use client';
import { useState } from 'react';
import { 
  FileBarChart, TrendingUp, Users, Calendar, DollarSign, 
  Award, Stethoscope, ArrowUpRight, Download, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Avatar } from '@/components/ui/Avatar';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AdminReportsClient({ 
  stats, 
  monthlyRevenue, 
  statusBreakdown, 
  topDoctors,
  specializationStats 
}) {
  const [timeRange, setTimeRange] = useState('6M');

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Revenue,PKR ${stats.totalRevenue}\n`
      + `Total Appointments,${stats.totalAppointments}\n`
      + `Completed Rate,${stats.completionRate}%\n`
      + `Total Patients,${stats.totalPatients}\n`
      + `Active Doctors,${stats.totalDoctors}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mediconnect_analytics_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Analytics & Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            System performance metrics, revenue analytics, and clinical utilization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-2">
            <span>Total Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            PKR {stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% from last month
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-2">
            <span>Completion Rate</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.completionRate}%
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.completedAppointments} of {stats.totalAppointments} bookings
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-2">
            <span>Active Patients</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalPatients}
          </p>
          <p className="text-xs text-purple-600 mt-1 font-medium">
            Registered accounts
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-2">
            <span>Verified Doctors</span>
            <Stethoscope className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalDoctors}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Practicing on platform
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Revenue Growth Trend</h2>
              <p className="text-xs text-gray-500 mt-0.5">Monthly platform earnings distribution</p>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={v => [`PKR ${v.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Appointment Status</h2>
            <p className="text-xs text-gray-500 mt-0.5">Lifecycle distribution</p>

            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [`${v} Bookings`, name]}
                    contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {statusBreakdown.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Doctors & Specialization Demand */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Doctors */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Top Consulted Doctors
          </h2>
          <p className="text-xs text-gray-500 mb-4">Ranked by completed appointments</p>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {topDoctors.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No doctor records yet</p>
            ) : (
              topDoctors.map((doc, idx) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                    <Avatar src={doc.user?.image} name={doc.user?.name} size="sm" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{doc.user?.name}</p>
                      <p className="text-xs text-primary-600 dark:text-primary-400">{doc.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{doc._count?.appointments || 0} visits</p>
                    <p className="text-xs text-gray-400">Rating: {(doc.rating || 5).toFixed(1)} ★</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Specialization Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Specialization Distribution
          </h2>
          <p className="text-xs text-gray-500 mb-4">Doctors mapped across medical fields</p>

          <div className="space-y-3">
            {specializationStats.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No specializations found</p>
            ) : (
              specializationStats.map(spec => (
                <div key={spec.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{spec.name}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{spec.count} Doctors</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(10, (spec.count / Math.max(1, stats.totalDoctors)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
