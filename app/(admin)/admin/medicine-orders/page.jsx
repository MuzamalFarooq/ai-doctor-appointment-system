import Link from 'next/link';
import { getAdminMedicineOrders, getAdminMedicineOrderStats } from '@/actions/medicine-order.actions';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  ShoppingBag,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Truck,
  XCircle,
  TrendingUp,
  Search,
  Filter,
  Eye,
  FileText,
} from 'lucide-react';

export const metadata = {
  title: 'Medicine Orders | Admin Dashboard',
  description: 'Manage online pharmacy medicine orders, prescription verifications, and delivery fulfillments.',
};

export default async function AdminMedicineOrdersPage({ searchParams }) {
  const rawParams = await searchParams;
  const q = rawParams?.q || '';
  const status = rawParams?.status || 'all';
  const paymentStatus = rawParams?.paymentStatus || 'all';
  const prescriptionStatus = rawParams?.prescriptionStatus || 'all';
  const page = parseInt(rawParams?.page || '1', 10);

  const [statsRes, ordersRes] = await Promise.all([
    getAdminMedicineOrderStats(),
    getAdminMedicineOrders({
      q,
      status,
      paymentStatus,
      prescriptionStatus,
      page,
      limit: 15,
    }),
  ]);

  const stats = statsRes.success ? statsRes.stats : {
    totalOrders: 0,
    pendingOrders: 0,
    awaitingPrescription: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    dispatchedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  };

  const orders = ordersRes.success ? ordersRes.orders : [];
  const total = ordersRes.success ? ordersRes.total : 0;
  const pageCount = ordersRes.success ? ordersRes.pageCount : 1;

  function getStatusBadge(orderStatus) {
    const config = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      AWAITING_PRESCRIPTION: 'bg-orange-50 text-orange-700 border-orange-200',
      PRESCRIPTION_REVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
      CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
      PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      READY_FOR_DISPATCH: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      SHIPPED: 'bg-teal-50 text-teal-700 border-teal-200',
      OUT_FOR_DELIVERY: 'bg-sky-50 text-sky-700 border-sky-200',
      DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
      REFUNDED: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    const cls = config[orderStatus] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${cls}`}>
        {orderStatus.replace(/_/g, ' ')}
      </span>
    );
  }

  function getPrescriptionBadge(pStatus) {
    if (pStatus === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </span>
      );
    }
    if (pStatus === 'PENDING_REVIEW' || pStatus === 'PENDING_UPLOAD') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
          <ShieldAlert className="h-3 w-3" /> Review Req.
        </span>
      );
    }
    if (pStatus === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
          <XCircle className="h-3 w-3" /> Rejected
        </span>
      );
    }
    return <span className="text-xs text-slate-400">OTC (Not Req.)</span>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-950 dark:text-white flex items-center gap-2.5">
            <Package className="h-7 w-7 text-teal-600" /> Medicine Orders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review pharmacy orders, verify doctor prescriptions, and manage dispatch logistics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/medicines"
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            Manage Inventory
          </Link>
          <Link
            href="/medicines"
            target="_blank"
            className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-800 shadow-xs"
          >
            View Public Pharmacy
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Orders</span>
            <ShoppingBag className="h-4 w-4 text-teal-600" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalOrders}
          </p>
          <p className="mt-1 text-xs text-slate-400">All recorded orders</p>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-bold uppercase">
            <span>Awaiting Rx Review</span>
            <ShieldAlert className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-amber-900 dark:text-amber-300">
            {stats.awaitingPrescription}
          </p>
          <p className="mt-1 text-xs text-amber-700/80">Pending doctor Rx verification</p>
        </div>

        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 text-xs font-bold uppercase">
            <span>Confirmed / Active</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-blue-900 dark:text-blue-300">
            {stats.confirmedOrders + stats.processingOrders}
          </p>
          <p className="mt-1 text-xs text-blue-700/80">Ready for packaging</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
            <span>Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-emerald-900 dark:text-emerald-300">
            {stats.deliveredOrders}
          </p>
          <p className="mt-1 text-xs text-emerald-700/80">Successfully completed</p>
        </div>

        <div className="rounded-2xl border border-teal-200 dark:border-teal-900/40 bg-teal-50/40 dark:bg-teal-950/20 p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-teal-700 dark:text-teal-400 text-xs font-bold uppercase">
            <span>Total Revenue</span>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-teal-900 dark:text-teal-300">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-teal-700/80">Excluding cancellations</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <form method="GET" action="/admin/medicine-orders" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by order #, customer name, phone, or email..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-slate-900 dark:text-white outline-none focus:border-teal-600"
            />
          </div>

          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="all">All Order Statuses</option>
            <option value="AWAITING_PRESCRIPTION">Awaiting Prescription</option>
            <option value="PRESCRIPTION_REVIEW">Prescription Review</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            name="prescriptionStatus"
            defaultValue={prescriptionStatus}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="all">All Prescription Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="NOT_REQUIRED">Not Required (OTC)</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition"
          >
            Filter Orders
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {total} {total === 1 ? 'Order' : 'Orders'} Found
          </p>
          {(q || status !== 'all' || prescriptionStatus !== 'all') && (
            <Link
              href="/admin/medicine-orders"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Reset Filters
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-base font-bold text-slate-900 dark:text-white">No medicine orders found</p>
            <p className="mt-1 text-xs text-slate-500">
              Orders placed by customers through the medicine store will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Prescription</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-950 dark:text-white">
                      <Link href={`/admin/medicine-orders/${order.id}`} className="hover:text-teal-600 underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{order.customerName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{order.customerPhone}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-semibold">
                      {order.items?.length || 0} products
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(order.finalTotal)}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{order.paymentMethod}</p>
                      <span className={`text-[10px] font-bold uppercase ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {getPrescriptionBadge(order.prescriptionStatus)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(order.orderStatus)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/medicine-orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition"
                      >
                        <Eye className="h-3 w-3" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center text-xs">
            <span className="text-slate-500">Page {page} of {pageCount}</span>
            <div className="flex gap-1">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => (
                <Link
                  key={num}
                  href={`/admin/medicine-orders?page=${num}&q=${encodeURIComponent(q)}&status=${status}`}
                  className={`rounded-lg px-3 py-1.5 font-bold ${num === page ? 'bg-teal-700 text-white' : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
                >
                  {num}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
