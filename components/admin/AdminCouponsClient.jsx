'use client';
import { useState } from 'react';
import { 
  Ticket, Plus, Search, Copy, Check, Trash2, Power, 
  Percent, Calendar, Users, AlertCircle 
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { createCoupon, toggleCouponActive, deleteCoupon } from '@/actions/admin.actions';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function AdminCouponsClient({ coupons: initialCoupons }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    isPercentage: true,
    maxUses: '100',
    expiresAt: '',
    isActive: true,
  });

  const filtered = coupons.filter(c => {
    const q = search.toLowerCase();
    return c.code.toLowerCase().includes(q);
  });

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount) {
      toast.error('Please enter coupon code and discount amount.');
      return;
    }

    setLoading(true);
    const res = await createCoupon(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success('Coupon created successfully!');
      setCoupons(prev => [res.coupon, ...prev]);
      setIsModalOpen(false);
      setFormData({
        code: '',
        discount: '',
        isPercentage: true,
        maxUses: '100',
        expiresAt: '',
        isActive: true,
      });
    }
    setLoading(false);
  };

  const handleToggle = async (id) => {
    const res = await toggleCouponActive(id);
    if (res?.error) toast.error(res.error);
    else {
      toast.success('Coupon status updated');
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    const res = await deleteCoupon(id);
    if (res?.error) toast.error(res.error);
    else {
      toast.success('Coupon deleted');
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Coupons & Promo Codes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and track promotional discount campaigns for appointments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search coupon code..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Coupon Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Ticket className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No Coupons Active</h3>
          <p className="text-sm text-gray-500 mt-1">Generate discount codes for marketing campaigns.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => {
            const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const isExhausted = c.usedCount >= c.maxUses;
            const percentUsed = Math.min(100, Math.round((c.usedCount / c.maxUses) * 100));

            return (
              <div
                key={c.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                  !c.isActive || isExpired || isExhausted
                    ? 'border-gray-200 dark:border-gray-700 opacity-75'
                    : 'border-primary-200/80 dark:border-primary-900/40 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-black tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-lg border border-primary-200 dark:border-primary-800/60">
                        {c.code}
                      </span>
                      <button
                        onClick={() => handleCopy(c.code)}
                        className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md"
                        title="Copy Code"
                      >
                        {copiedCode === c.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      !c.isActive ? 'bg-gray-100 text-gray-600 border-gray-200' :
                      isExpired ? 'bg-red-50 text-red-700 border-red-200' :
                      isExhausted ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {!c.isActive ? 'Inactive' : isExpired ? 'Expired' : isExhausted ? 'Exhausted' : 'Active'}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="mb-4">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      {c.isPercentage ? `${c.discount}% OFF` : `PKR ${c.discount} OFF`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {c.isPercentage ? 'Applied as percentage on fee' : 'Flat deduction'}
                    </p>
                  </div>

                  {/* Usage Progress */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Usage</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {c.usedCount} / {c.maxUses} uses
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percentUsed >= 90 ? 'bg-red-500' : percentUsed >= 60 ? 'bg-amber-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>

                  {/* Expiration Info */}
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {c.expiresAt ? (
                      <span>Expires: {formatDate(c.expiresAt)}</span>
                    ) : (
                      <span>Never expires</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/80">
                  <button
                    onClick={() => handleToggle(c.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                      c.isActive
                        ? 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400'
                        : 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400'
                    }`}
                  >
                    <Power className="w-3 h-3" /> {c.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Coupon"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. HEALTH50"
                className="w-full px-3 py-2 text-sm font-mono uppercase rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Discount Amount *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: e.target.value })}
                  placeholder={formData.isPercentage ? 'e.g. 20 (%)' : 'e.g. 500 (PKR)'}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
                <select
                  value={formData.isPercentage ? 'percent' : 'flat'}
                  onChange={e => setFormData({ ...formData, isPercentage: e.target.value === 'percent' })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Amount (PKR)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Max Uses</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="100"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="couponActive"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="couponActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Immediately Active
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-60"
              >
                {loading ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
