'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SAMPLE_DATA = [
  { month: 'Jul', earnings: 45000 },
  { month: 'Aug', earnings: 52000 },
  { month: 'Sep', earnings: 48000 },
  { month: 'Oct', earnings: 61000 },
  { month: 'Nov', earnings: 55000 },
  { month: 'Dec', earnings: 72000 },
  { month: 'Jan', earnings: 68000 },
];

export function DoctorEarningsChart({ data = SAMPLE_DATA }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Monthly Earnings</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1d7ceb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1d7ceb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => [`PKR ${v.toLocaleString()}`, 'Earnings']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', fontSize: '12px' }} />
            <Area type="monotone" dataKey="earnings" stroke="#1d7ceb" strokeWidth={2} fill="url(#earningsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
