import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomerMedicineOrder } from '@/actions/medicine-order.actions';
import { CancelOrderButton } from '@/components/orders/CancelOrderButton';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Package,
  Clock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';

export const metadata = {
  title: 'Track Medicine Order | MediConnect AI',
};

export default async function CustomerOrderDetailPage({ params, searchParams }) {
  const { id } = await params;
  const rawQuery = await searchParams;
  const justConfirmed = rawQuery?.confirmed === 'true';

  const res = await getCustomerMedicineOrder(id);
  if (!res.success || !res.order) {
    notFound();
  }

  const order = res.order;
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];

  // Stepper Calculation
  const isCancelled = order.orderStatus === 'CANCELLED' || order.orderStatus === 'REJECTED';
  const hasPrescription = order.prescriptionStatus !== 'NOT_REQUIRED';

  const steps = [
    { label: 'Order Placed', active: true, done: true },
    ...(hasPrescription
      ? [
          {
            label: 'Rx Verification',
            active: ['PRESCRIPTION_REVIEW', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus),
            done: ['CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus),
          },
        ]
      : []),
    {
      label: 'Confirmed & Packing',
      active: ['CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus),
      done: ['READY_FOR_DISPATCH', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus),
    },
    {
      label: 'Dispatched / Courier',
      active: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus),
      done: ['DELIVERED'].includes(order.orderStatus),
    },
    {
      label: 'Delivered',
      active: order.orderStatus === 'DELIVERED',
      done: order.orderStatus === 'DELIVERED',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/my-medicine-orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-900 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Orders
          </Link>
        </div>

        {/* Confirmation banner if just placed */}
        {justConfirmed && (
          <div className="mb-6 rounded-3xl border border-emerald-300 bg-emerald-50 p-6 shadow-xs flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950">Thank you for your order!</h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your order #{order.orderNumber} has been received. Our licensed pharmacy team is preparing your package. A confirmation email has been dispatched.
              </p>
            </div>
          </div>
        )}

        {/* Order Header & Actions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-950">
                  Order #{order.orderNumber}
                </h1>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 border border-teal-200">
                  {order.orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <CancelOrderButton orderId={order.id} orderStatus={order.orderStatus} />
            </div>
          </div>

          {/* Stepper Progress */}
          {!isCancelled ? (
            <div className="mt-8 border-b border-slate-100 pb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                Fulfillment Progress
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {steps.map((st, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition shadow-xs ${
                        st.done
                          ? 'bg-emerald-600 text-white'
                          : st.active
                          ? 'bg-teal-700 text-white ring-4 ring-teal-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {st.done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold ${
                        st.active ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <p className="font-bold">This order was cancelled.</p>
              {order.cancellationReason && (
                <p className="mt-1">Reason: {order.cancellationReason}</p>
              )}
            </div>
          )}

          {/* Purchased Items */}
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              Purchased Medicines ({order.items.length})
            </h2>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center text-teal-800 font-bold overflow-hidden shrink-0">
                      {item.medicine?.imageUrl ? (
                        <img src={item.medicine.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{item.dosageForm || 'MED'}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      {item.genericName && (
                        <p className="text-slate-500">Generic: {item.genericName}</p>
                      )}
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                        {item.prescriptionReq && (
                          <span className="ml-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded">
                            Rx
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <dl className="mt-6 border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</dd>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discounts</dt>
                  <dd className="font-semibold">- {formatCurrency(order.discountTotal)}</dd>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <dt>Delivery Fee ({order.deliveryMethod})</dt>
                <dd className="font-semibold text-slate-900">
                  {order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}
                </dd>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-bold text-slate-950">
                <dt>Total Amount</dt>
                <dd className="text-teal-900">{formatCurrency(order.finalTotal)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Delivery & Payment Details */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Delivery Location */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-teal-700" /> Delivery Address
            </h3>
            <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{order.deliveryAddress}</p>
            <p className="text-xs text-slate-500 mt-0.5">{order.city} {order.postalCode ? `· ${order.postalCode}` : ''}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-slate-400" /> {order.customerPhone}
            </p>
          </div>

          {/* Payment & Prescription */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Payment Method
              </h3>
              <p className="text-sm font-bold text-slate-900">{order.paymentMethod}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Status:{' '}
                <span className={`font-bold uppercase ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>

            {order.prescriptionUrl && (
              <div className="border-t border-slate-100 pt-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-amber-600" /> Prescription Verification
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-800">
                    {order.prescriptionStatus}
                  </span>
                  <a
                    href={order.prescriptionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> View Prescription
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Timeline History */}
        {history.length > 0 && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-teal-700" /> Live Status Timeline
            </h3>
            <div className="space-y-4">
              {history.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">{step.status}</span>
                    <span className="text-slate-400 ml-2">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                    <p className="text-slate-600 mt-0.5">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
