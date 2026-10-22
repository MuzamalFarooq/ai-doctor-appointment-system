'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  updateMedicineOrderStatus,
  reviewPrescriptionVerification,
} from '@/actions/medicine-order.actions';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Clock,
  AlertTriangle,
  Loader2,
  FileCheck,
  Ban,
  DollarSign,
} from 'lucide-react';

export function MedicineOrderAdminActions({ order }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const currentStatus = order.orderStatus;
  const prescriptionStatus = order.prescriptionStatus;

  const handleStatusChange = async (nextStatus, note = '') => {
    if (!confirm(`Are you sure you want to change order status to "${nextStatus.replace(/_/g, ' ')}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await updateMedicineOrderStatus({
        orderId: order.id,
        nextStatus,
        note,
      });

      if (!res.success) {
        toast.error(res.error || 'Failed to update order status');
      } else {
        toast.success(`Order status updated to ${nextStatus.replace(/_/g, ' ')}`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during status update.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      const res = await updateMedicineOrderStatus({
        orderId: order.id,
        nextStatus: order.orderStatus,
        paymentStatus: 'PAID',
        note: 'Payment collected and verified by administrator.',
      });

      if (!res.success) {
        toast.error(res.error || 'Failed to update payment status');
      } else {
        toast.success('Order payment status marked as PAID.');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update payment status.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionReview = async (decision) => {
    if (decision === 'REJECT' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for prescription rejection.');
      return;
    }

    setLoading(true);
    try {
      const res = await reviewPrescriptionVerification({
        orderId: order.id,
        decision,
        rejectionReason,
      });

      if (!res.success) {
        toast.error(res.error || 'Prescription review failed');
      } else {
        toast.success(
          decision === 'APPROVE'
            ? 'Prescription approved and order confirmed!'
            : 'Prescription rejected and inventory restored.'
        );
        setRejectModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Prescription review error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please specify a cancellation reason.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateMedicineOrderStatus({
        orderId: order.id,
        nextStatus: 'CANCELLED',
        note: cancelReason,
      });

      if (!res.success) {
        toast.error(res.error || 'Failed to cancel order');
      } else {
        toast.success('Order cancelled and reserved stock restored.');
        setCancelModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Prescription Review Controls (if prescription review needed) */}
      {prescriptionStatus === 'PENDING_REVIEW' && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50/60 p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-600 text-white">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">
                Prescription Action Required
              </h3>
              <p className="text-xs text-amber-800">
                Customer submitted a prescription document for verification. Verify the medication dosage, doctor credentials, and approval before dispensing.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handlePrescriptionReview('APPROVE')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve Prescription & Confirm Order
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setRejectModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition"
            >
              <XCircle className="h-4 w-4" /> Reject Prescription
            </button>
          </div>
        </div>
      )}

      {/* 2. Order Fulfillment Status Transition Controls */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Order Status Actions
        </h3>

        <div className="flex flex-wrap gap-2.5">
          {currentStatus === 'CONFIRMED' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleStatusChange('PROCESSING', 'Order being packed and verified.')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              <Package className="h-4 w-4" /> Mark Processing
            </button>
          )}

          {currentStatus === 'PROCESSING' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleStatusChange('READY_FOR_DISPATCH', 'Package sealed and handed to dispatch desk.')}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-700 transition"
            >
              <Package className="h-4 w-4" /> Ready for Dispatch
            </button>
          )}

          {(currentStatus === 'READY_FOR_DISPATCH' || currentStatus === 'PROCESSING') && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleStatusChange('SHIPPED', 'Dispatched with pharmaceutical courier.')}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition"
            >
              <Truck className="h-4 w-4" /> Mark Dispatched / Shipped
            </button>
          )}

          {currentStatus === 'SHIPPED' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleStatusChange('OUT_FOR_DELIVERY', 'Rider is en route to customer destination.')}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition"
            >
              <Truck className="h-4 w-4" /> Mark Out for Delivery
            </button>
          )}

          {(currentStatus === 'SHIPPED' || currentStatus === 'OUT_FOR_DELIVERY') && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleStatusChange('DELIVERED', 'Delivered safely to recipient.')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <CheckCircle2 className="h-4 w-4" /> Mark Delivered
            </button>
          )}

          {order.paymentStatus === 'PENDING' && currentStatus === 'DELIVERED' && (
            <button
              type="button"
              disabled={loading}
              onClick={handleMarkPaid}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
            >
              <DollarSign className="h-4 w-4" /> Confirm Cash Collection (Mark PAID)
            </button>
          )}

          {currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED' && currentStatus !== 'REJECTED' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
            >
              <Ban className="h-4 w-4" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Reject Prescription Verification
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Provide a clear medical reason for rejecting this prescription (e.g. illegible doctor signature, expired date, unapproved dosage).
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for prescription rejection..."
              className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 outline-none focus:border-rose-600"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePrescriptionReview('REJECT')}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Cancel Medicine Order</h3>
            <p className="mt-1 text-xs text-slate-500">
              Cancelling this order will automatically restore all reserved stock and batches back into available pharmacy inventory.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for order cancellation..."
              className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 outline-none focus:border-rose-600"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleCancelOrder}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
