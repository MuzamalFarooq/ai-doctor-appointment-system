'use client';
import { useState } from 'react';
import { 
  CreditCard, Search, DollarSign, CheckCircle2, Clock, 
  AlertOctagon, ArrowUpRight, RefreshCcw, FileText, User
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { updatePaymentStatus } from '@/actions/admin.actions';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'];
const METHODS = ['ALL', 'STRIPE', 'JAZZCASH', 'EASYPAISA', 'CASH'];

const STATUS_STYLE = {
  PAID: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  FAILED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
};

const METHOD_STYLE = {
  STRIPE: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
  JAZZCASH: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  EASYPAISA: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  CASH: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export function AdminPaymentsClient({ payments: initialPayments }) {
  const [payments, setPayments] = useState(initialPayments);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [activeMethod, setActiveMethod] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const filtered = payments
    .filter(p => activeStatus === 'ALL' || p.status === activeStatus)
    .filter(p => activeMethod === 'ALL' || p.method === activeMethod)
    .filter(p => {
      const q = search.toLowerCase();
      const patientName = p.patient?.user?.name?.toLowerCase() || '';
      const doctorName = p.appointment?.doctor?.user?.name?.toLowerCase() || '';
      const coupon = p.couponCode?.toLowerCase() || '';
      const stripeId = p.stripePaymentId?.toLowerCase() || '';
      return patientName.includes(q) || doctorName.includes(q) || coupon.includes(q) || stripeId.includes(q);
    });

  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingAmount = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleStatusChange = async (id, newStatus) => {
    setLoadingId(id);
    const res = await updatePaymentStatus(id, newStatus);
    if (res?.error) toast.error(res.error);
    else {
      toast.success(`Payment updated to ${newStatus}`);
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
    setLoadingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
          Payments & Transactions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor revenue, payment gateways (Stripe, JazzCash, Easypaisa), and refund status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Collected Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            PKR {totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {payments.filter(p => p.status === 'PAID').length} Successful transactions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending Clearance</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
            PKR {pendingAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {payments.filter(p => p.status === 'PENDING').length} Pending invoices
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{payments.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">All processed records</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">Failed / Refunded</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
            {payments.filter(p => p.status === 'FAILED' || p.status === 'REFUNDED').length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Disputes or reversals</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by patient, doctor, or coupon..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Method:</span>
            {METHODS.map(method => (
              <button
                key={method}
                onClick={() => setActiveMethod(method)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                  activeMethod === method
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto border-t border-gray-100 dark:border-gray-700/60 pt-3">
          {STATUSES.map(status => {
            const count = status === 'ALL' ? payments.length : payments.filter(p => p.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
                  activeStatus === status
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {status}
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeStatus === status ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transactions Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No Transactions Found</h3>
          <p className="text-sm text-gray-500 mt-1">No payments match the applied filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={p.patient?.user?.image} name={p.patient?.user?.name || 'Patient'} size="sm" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{p.patient?.user?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400">{p.patient?.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {p.appointment?.doctor?.user?.name || 'Dr. Consulted'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.appointment ? formatDate(p.appointment.date) : 'N/A'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900 dark:text-white">
                          PKR {(p.amount || 0).toLocaleString()}
                        </p>
                        {p.discount > 0 && (
                          <p className="text-xs text-green-600 font-medium">
                            -PKR {p.discount.toLocaleString()} ({p.couponCode || 'Promo'})
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${METHOD_STYLE[p.method] || 'bg-gray-100 text-gray-700'}`}>
                        {p.method}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={p.status}
                        disabled={loadingId === p.id}
                        onChange={e => handleStatusChange(p.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:ring-2 focus:ring-primary-500 focus:outline-none ${STATUS_STYLE[p.status] || ''}`}
                      >
                        {STATUSES.filter(s => s !== 'ALL').map(s => (
                          <option key={s} value={s} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
