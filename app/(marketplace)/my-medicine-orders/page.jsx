import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getCustomerMedicineOrders } from '@/actions/medicine-order.actions';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  ShoppingBag,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  ArrowRight,
  LogIn,
} from 'lucide-react';

export const metadata = {
  title: 'My Medicine Orders | MediConnect AI',
  description: 'View and track your online medicine purchases, prescription verification, and fulfillment status.',
};

export default async function MyMedicineOrdersPage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center max-w-md shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Sign in to View Your Orders</h1>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Please log in to your MediConnect account to view your past medicine orders, track live dispatch, and review prescriptions.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/login?callbackUrl=/my-medicine-orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition"
            >
              <LogIn className="h-4 w-4" /> Log In
            </Link>
            <Link
              href="/medicines"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Browse Medicines Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const res = await getCustomerMedicineOrders();
  const orders = res.success ? res.orders : [];

  function getStatusBadge(orderStatus) {
    const config = {
      PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
      AWAITING_PRESCRIPTION: 'bg-orange-50 text-orange-800 border-orange-200',
      PRESCRIPTION_REVIEW: 'bg-purple-50 text-purple-800 border-purple-200',
      CONFIRMED: 'bg-blue-50 text-blue-800 border-blue-200',
      PROCESSING: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      READY_FOR_DISPATCH: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      SHIPPED: 'bg-teal-50 text-teal-800 border-teal-200',
      OUT_FOR_DELIVERY: 'bg-sky-50 text-sky-800 border-sky-200',
      DELIVERED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      CANCELLED: 'bg-rose-50 text-rose-800 border-rose-200',
      REJECTED: 'bg-red-50 text-red-800 border-red-200',
    };
    const cls = config[orderStatus] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${cls}`}>
        {orderStatus.replace(/_/g, ' ')}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-950">
              My Medicine Orders
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track the preparation, prescription verification, and courier dispatch of your medications.
            </p>
          </div>
          <Link
            href="/medicines"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition shrink-0"
          >
            <ShoppingBag className="h-4 w-4" /> Order Medicines
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
              <Package className="h-10 w-10 stroke-[1.5]" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-950">No orders placed yet</h2>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
              When you purchase medicines from MediConnect Pharmacy, your order details and delivery timeline will show up here.
            </p>
            <div className="mt-6">
              <Link
                href="/medicines"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition"
              >
                Browse Medicines Catalog <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-teal-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-950 text-sm sm:text-base">
                        #{order.orderNumber}
                      </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Ordered on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <span className="text-xs text-slate-400">Total Amount</span>
                    <span className="text-lg font-bold text-teal-900">
                      {formatCurrency(order.finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="py-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Items ({order.items.length})
                  </p>
                  <ul className="divide-y divide-slate-50 text-xs text-slate-700">
                    {order.items.slice(0, 3).map((it) => (
                      <li key={it.id} className="py-1.5 flex justify-between">
                        <span>
                          <strong>{it.name}</strong> × {it.quantity}
                          {it.prescriptionReq && (
                            <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                              Rx
                            </span>
                          )}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(it.subtotal)}
                        </span>
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="pt-2 text-slate-400 text-[11px]">
                        + {order.items.length - 3} more items...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>Payment: <strong className="text-slate-800">{order.paymentMethod}</strong></span>
                    <span>·</span>
                    <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  <Link
                    href={`/my-medicine-orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 transition"
                  >
                    <Eye className="h-3.5 w-3.5" /> Order Details & Tracking
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
