'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelCustomerMedicineOrder } from '@/actions/medicine-order.actions';
import toast from 'react-hot-toast';
import { Ban, Loader2 } from 'lucide-react';

export function CancelOrderButton({ orderId, orderStatus }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState('Change of mind / Ordered by mistake');
  const [cancelling, setCancelling] = useState(false);

  // Strictly check eligible states
  const eligible = [
    'PENDING',
    'AWAITING_PRESCRIPTION',
    'PRESCRIPTION_REVIEW',
    'CONFIRMED',
  ].includes(orderStatus);

  if (!eligible) return null;

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error('Please specify a cancellation reason.');
      return;
    }

    setCancelling(true);
    try {
      const res = await cancelCustomerMedicineOrder(orderId, reason);
      if (!res.success) {
        toast.error(res.error || 'Failed to cancel order.');
      } else {
        toast.success('Order cancelled successfully.');
        setModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not cancel order at this moment.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
      >
        <Ban className="h-3.5 w-3.5" /> Cancel Order
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Cancel Medicine Order</h3>
            <p className="mt-1 text-xs text-slate-500">
              Are you sure you want to cancel this order? This action cannot be undone and your reserved medicines will be released back to pharmacy inventory.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for Cancellation
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none"
              >
                <option value="Change of mind / Ordered by mistake">Change of mind / Ordered by mistake</option>
                <option value="Doctor modified my prescription">Doctor modified my prescription</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Found alternative medication">Found alternative medication</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
