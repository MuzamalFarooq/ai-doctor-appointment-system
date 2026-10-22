import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminMedicineOrder } from '@/actions/medicine-order.actions';
import { MedicineOrderAdminActions } from '@/components/admin/MedicineOrderAdminActions';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export const metadata = {
  title: 'Order Details | Admin Dashboard',
};

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const res = await getAdminMedicineOrder(id);

  if (!res.success || !res.order) {
    notFound();
  }

  const order = res.order;
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/medicine-orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Medicine Orders
        </Link>
        <span className="font-mono text-xs font-bold text-slate-400">ID: {order.id}</span>
      </div>

      {/* Main Order Header */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-heading text-slate-950 dark:text-white">
                Order #{order.orderNumber}
              </h1>
              <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Placed on {new Date(order.createdAt).toLocaleString()} · {order.deliveryMethod.toUpperCase()} Delivery
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-2xl font-extrabold text-teal-800 dark:text-teal-400">
              {formatCurrency(order.finalTotal)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6">
          <MedicineOrderAdminActions order={order} />
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Order Items */}
        <div className="space-y-6 lg:col-span-8">
          {/* Purchased Items Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-teal-600" />
              Purchased Medicines ({order.items.length})
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="h-14 w-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-teal-700 font-bold text-xs uppercase overflow-hidden shrink-0">
                      {item.medicine?.imageUrl ? (
                        <img src={item.medicine.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{item.dosageForm || 'MED'}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h3>
                        {item.prescriptionReq && (
                          <span className="rounded bg-amber-600 px-1.5 py-0.2 text-[9px] font-black uppercase text-white">
                            Rx
                          </span>
                        )}
                      </div>
                      {item.genericName && (
                        <p className="text-xs text-slate-500">Generic: {item.genericName}</p>
                      )}
                      <div className="mt-1 flex gap-3 text-[11px] text-slate-400">
                        {item.sku && <span>SKU: {item.sku}</span>}
                        {item.batchNumber && (
                          <span className="text-teal-700 dark:text-teal-400 font-medium">
                            Batch: {item.batchNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0">
                    <p className="text-xs text-slate-500">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <dl className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{formatCurrency(order.subtotal)}</dd>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Discounts</dt>
                  <dd className="font-semibold">- {formatCurrency(order.discountTotal)}</dd>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <dt>Delivery Charges</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}
                </dd>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-base font-bold text-slate-950 dark:text-white">
                <dt>Final Order Total</dt>
                <dd className="text-teal-800 dark:text-teal-400">{formatCurrency(order.finalTotal)}</dd>
              </div>
            </dl>
          </div>

          {/* Prescription Document Card */}
          {order.prescriptionUrl && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 mb-3">
                <FileCheck2 className="h-5 w-5 text-amber-600" />
                Submitted Doctor Prescription
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Verify this medical prescription for active patient credentials, doctor signature, and authorized drug quantities.
              </p>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold text-xs">
                    Rx
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Patient Prescription Document
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Status:{' '}
                      <span className="font-bold uppercase text-amber-700">
                        {order.prescriptionStatus}
                      </span>
                    </p>
                  </div>
                </div>

                <a
                  href={order.prescriptionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View / Inspect Full Document
                </a>
              </div>

              {order.prescriptionNotes && (
                <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-600">
                  <span className="font-bold text-slate-900 dark:text-white">Customer Notes: </span>
                  {order.prescriptionNotes}
                </div>
              )}
            </div>
          )}

          {/* Audit Trail & Status Timeline */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-teal-600" />
              Status Audit History
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {history.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-0.5 h-3 w-3 rounded-full bg-teal-600 ring-4 ring-white dark:ring-slate-900" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {step.status}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{step.note}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(step.timestamp).toLocaleString()} · by {step.changedBy || 'System'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Details */}
        <div className="space-y-6 lg:col-span-4">
          {/* Customer Details */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-teal-600" /> Customer Information
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Name</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{order.customerName}</p>
              </div>
              <div>
                <span className="text-slate-400">Phone</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-teal-600" /> {order.customerPhone}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Email</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-teal-600" /> {order.customerEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-600" /> Delivery Address
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Address</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5 leading-relaxed">
                  {order.deliveryAddress}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">City</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{order.city}</p>
                </div>
                <div>
                  <span className="text-slate-400">Postal Code</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{order.postalCode || 'N/A'}</p>
                </div>
              </div>
              {order.orderNotes && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-slate-400 font-medium">Delivery Notes</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5 italic">{order.orderNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Overview */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-teal-600" /> Payment Status
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-bold text-slate-900 dark:text-white">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Status</span>
                <span className={`font-bold uppercase ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
