import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ title, value, icon: Icon, change, changeLabel, color = 'blue', className }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/30',
    red: 'from-red-500 to-red-600 shadow-red-500/30',
    teal: 'from-teal-500 to-teal-600 shadow-teal-500/30',
  };
  const positive = change > 0;

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-card', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg', colors[color])}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full', positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600')}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {changeLabel && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{changeLabel}</p>}
      </div>
    </div>
  );
}
