'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SAMPLE_DATA = [
  { month: 'Jul', revenue: 120000 },
  { month: 'Aug', revenue: 145000 },
  { month: 'Sep', revenue: 130000 },
  { month: 'Oct', revenue: 170000 },
  { month: 'Nov', revenue: 165000 },
  { month: 'Dec', revenue: 195000 },
  { month: 'Jan', revenue: 210000 },
];

export function AdminRevenueChart({ data = SAMPLE_DATA }) {
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
          <Tooltip 
            formatter={v => [`PKR ${v.toLocaleString()}`, 'Revenue']} 
            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', fontSize: '12px' }} 
          />
          <Bar dataKey="revenue" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
