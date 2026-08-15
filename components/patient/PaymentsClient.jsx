'use client';
import { CreditCard, CheckCircle, XCircle, Clock, RefreshCw, Calendar, User, Download } from 'lucide-react';

const STATUS_CONFIG = {
  PAID: { label: 'Paid', icon: CheckCircle, className: 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400' },
  PENDING: { label: 'Pending', icon: Clock, className: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400' },
  FAILED: { label: 'Failed', icon: XCircle, className: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400' },
  REFUNDED: { label: 'Refunded', icon: RefreshCw, className: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400' },
};

export function PaymentsClient({ payments }) {
  const total = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const pending = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-6">Payment History</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: 'Total Paid', value: `PKR ${total.toLocaleString()}`, color: 'from-green-500 to-emerald-600' },
          { label: 'Pending', value: `PKR ${pending.toLocaleString()}`, color: 'from-amber-500 to-orange-600' },
          { label: 'Transactions', value: payments.length, color: 'from-primary-500 to-accent-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white`}>
            <p className="text-white/80 text-xs uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-black mt-1">{value}</p>
          </div>
        ))}
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No payment records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(p => {
            const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = config.icon;
            return (
              <div key={p.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.appointment?.doctor?.user?.name || 'Doctor'}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.createdAt).toLocaleDateString()}</span>
                    <span>{p.method}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">PKR {p.amount.toLocaleString()}</p>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${config.className}`}>
                    <StatusIcon className="w-3 h-3" />{config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
