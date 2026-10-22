'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import { createMedicineOrder } from '@/actions/medicine-order.actions';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ShoppingBag,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Upload,
  FileCheck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    city: 'Lahore',
    postalCode: '',
    orderNotes: '',
    deliveryMethod: 'standard', // 'standard' or 'express'
    paymentMethod: 'CASH', // 'CASH' (Cash on Delivery), 'STRIPE', etc.
  });

  // Prescription State
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Autofill with session user profile
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || session.user.name || '',
        customerEmail: prev.customerEmail || session.user.email || '',
      }));
    }
  }, [session]);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center max-w-md shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-slate-500">
            Please add medicines or healthcare products to your cart before proceeding to checkout.
          </p>
          <Link
            href="/medicines"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, it) => sum + it.effectivePrice * it.quantity, 0);
  const originalSubtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const savings = Math.max(0, originalSubtotal - subtotal);
  const deliveryFee =
    formData.deliveryMethod === 'express' ? 300 : subtotal >= 2000 ? 0 : 150;
  const finalTotal = subtotal + deliveryFee;
  const hasPrescription = items.some((it) => it.prescriptionRequired);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePrescriptionUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size cannot exceed 10MB.');
      return;
    }

    setUploadingPrescription(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Failed to upload prescription');
      }

      setPrescriptionUrl(result.url);
      setPrescriptionFile(file);
      toast.success('Prescription uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Prescription upload failed.');
    } finally {
      setUploadingPrescription(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.customerName.trim()) errs.customerName = 'Name is required';
    if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@'))
      errs.customerEmail = 'Valid email is required';
    if (!formData.customerPhone.trim()) errs.customerPhone = 'Phone number is required';
    if (!formData.deliveryAddress.trim()) errs.deliveryAddress = 'Delivery address is required';
    if (!formData.city.trim()) errs.city = 'City is required';

    if (hasPrescription && !prescriptionUrl) {
      errs.prescription =
        'Prescription is mandatory because your cart contains prescription (Rx) medicines.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please complete all required fields correctly.');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      prescriptionUrl: prescriptionUrl || null,
      prescriptionNotes: prescriptionNotes || null,
      items: items.map((it) => ({ id: it.id, quantity: it.quantity })),
    };

    try {
      const res = await createMedicineOrder(payload);

      if (!res.success) {
        toast.error(res.error || 'Failed to place order');
        setSubmitting(false);
        return;
      }

      // Order created successfully
      clearCart();
      toast.success(`Order #${res.orderNumber} placed successfully!`);
      router.push(`/my-medicine-orders/${res.orderId}?confirmed=true`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An unexpected error occurred.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Cart
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-heading font-extrabold text-slate-950">
            Secure Medicine Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Provide your delivery and contact details for safe pharmaceutical dispatch.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Checkout Form */}
          <div className="space-y-6 lg:col-span-8">
            {/* 1. Contact & Customer Info */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                  1
                </span>
                Customer & Contact Information
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Full Name *
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Ahmad Khan"
                    className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 ${
                      errors.customerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-xs text-rose-600">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="customerPhone"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Phone / Mobile Number *
                  </label>
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. 0300 1234567"
                    className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 ${
                      errors.customerPhone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.customerPhone && (
                    <p className="mt-1 text-xs text-rose-600">{errors.customerPhone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="customerEmail"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Email Address (for order receipts and tracking updates) *
                  </label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder="e.g. ahmad.khan@example.com"
                    className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 ${
                      errors.customerEmail ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.customerEmail && (
                    <p className="mt-1 text-xs text-rose-600">{errors.customerEmail}</p>
                  )}
                </div>
              </div>
            </section>

            {/* 2. Delivery Address */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                  2
                </span>
                Delivery Location
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="deliveryAddress"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Complete Street Address *
                  </label>
                  <input
                    id="deliveryAddress"
                    name="deliveryAddress"
                    type="text"
                    required
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder="House/Apartment #, Street, Sector, Area"
                    className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 ${
                      errors.deliveryAddress ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.deliveryAddress && (
                    <p className="mt-1 text-xs text-rose-600">{errors.deliveryAddress}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-slate-700">
                    City *
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 cursor-pointer"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                    <option value="Sialkot">Sialkot</option>
                    <option value="Gujranwala">Gujranwala</option>
                    <option value="Other">Other City</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Postal Code (Optional)
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 54000"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="orderNotes"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Delivery Instructions / Notes (Optional)
                  </label>
                  <textarea
                    id="orderNotes"
                    name="orderNotes"
                    rows={2}
                    value={formData.orderNotes}
                    onChange={handleInputChange}
                    placeholder="e.g. Ring doorbell, deliver during morning hours, etc."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                  />
                </div>
              </div>

              {/* Delivery Speed Options */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Delivery Speed
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition ${
                      formData.deliveryMethod === 'standard'
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/15'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="standard"
                        checked={formData.deliveryMethod === 'standard'}
                        onChange={handleInputChange}
                        className="text-teal-700 focus:ring-teal-600"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Standard Delivery</p>
                        <p className="text-xs text-slate-500">Delivered within 24–48 hours</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-800">
                      {subtotal >= 2000 ? 'FREE' : 'PKR 150'}
                    </span>
                  </label>

                  <label
                    className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition ${
                      formData.deliveryMethod === 'express'
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/15'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="express"
                        checked={formData.deliveryMethod === 'express'}
                        onChange={handleInputChange}
                        className="text-teal-700 focus:ring-teal-600"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Express Priority</p>
                        <p className="text-xs text-slate-500">Same-day delivery (within 3–6 hours)</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-800">PKR 300</span>
                  </label>
                </div>
              </div>
            </section>

            {/* 3. Prescription Upload / Validation (Mandatory for Rx Items) */}
            {hasPrescription && (
              <section className="rounded-3xl border border-amber-300 bg-amber-50/50 p-6 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-600 text-white shrink-0 mt-0.5">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-amber-950">
                      Prescription Verification Required
                    </h2>
                    <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                      Your cart contains prescription items. In accordance with Drug Regulatory Authority regulations, orders containing Rx medicines can only be dispensed after verification by our licensed pharmacists.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-amber-300 bg-white p-6 text-center">
                  {prescriptionUrl ? (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-900">
                        Prescription Document Attached
                      </p>
                      <p className="text-xs text-slate-500">
                        {prescriptionFile?.name || 'Verified document attached'}
                      </p>
                      <div className="mt-3 flex gap-3">
                        <a
                          href={prescriptionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-teal-800 underline"
                        >
                          View Document
                        </a>
                        <label className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer underline">
                          Replace File
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="sr-only"
                            onChange={handlePrescriptionUpload}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                        {uploadingPrescription ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <Upload className="h-6 w-6" />
                        )}
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-slate-900">
                        Upload Doctor Prescription Document
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                        Upload a photo or PDF of your doctor&apos;s written prescription. Supported formats: JPG, PNG, WebP, PDF (Max 10MB).
                      </p>
                      <div className="mt-4">
                        <label className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition cursor-pointer">
                          <Upload className="h-4 w-4" /> Choose Prescription File
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="sr-only"
                            onChange={handlePrescriptionUpload}
                            disabled={uploadingPrescription}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {errors.prescription && (
                  <p className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.prescription}
                  </p>
                )}

                <div className="mt-4">
                  <label
                    htmlFor="prescriptionNotes"
                    className="block text-xs font-semibold text-amber-950"
                  >
                    Notes for the Dispensing Pharmacist (Optional)
                  </label>
                  <input
                    id="prescriptionNotes"
                    type="text"
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    placeholder="e.g. Prescribed by Dr. Salman for acute infection"
                    className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>
              </section>
            )}

            {/* 4. Payment Method */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                  {hasPrescription ? 4 : 3}
                </span>
                Payment Options
              </h2>

              <div className="mt-5 space-y-3">
                <label
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 cursor-pointer transition ${
                    formData.paymentMethod === 'CASH'
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/15'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    checked={formData.paymentMethod === 'CASH'}
                    onChange={handleInputChange}
                    className="mt-1 text-teal-700 focus:ring-teal-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-teal-700" />
                      <p className="text-sm font-bold text-slate-900">Cash on Delivery (COD)</p>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Recommended
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Pay safely in cash to the delivery courier once you receive and inspect your sealed package. Payment status remains pending until confirmed collection.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 cursor-pointer transition ${
                    formData.paymentMethod === 'STRIPE'
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/15'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="STRIPE"
                    checked={formData.paymentMethod === 'STRIPE'}
                    onChange={handleInputChange}
                    className="mt-1 text-teal-700 focus:ring-teal-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-teal-700" />
                      <p className="text-sm font-bold text-slate-900">Credit / Debit Card</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Online payment securely processed via Stripe encrypted payment gateway.
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Order Review & Placement */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sticky top-24">
              <h2 className="text-lg font-bold text-slate-950">Review Your Order</h2>

              {/* Items List Snapshot */}
              <div className="mt-4 divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="py-2.5 flex justify-between gap-2 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 line-clamp-1">{it.name}</p>
                      <p className="text-slate-500">
                        Qty: {it.quantity} × {formatCurrency(it.effectivePrice)}
                        {it.prescriptionRequired && (
                          <span className="ml-1 text-[10px] font-bold text-amber-700">[Rx]</span>
                        )}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatCurrency(it.effectivePrice * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <dl className="mt-5 border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold text-slate-900">{formatCurrency(subtotal)}</dd>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Total Discount</dt>
                    <dd className="font-semibold">- {formatCurrency(savings)}</dd>
                  </div>
                )}

                <div className="flex justify-between">
                  <dt>Delivery Charges</dt>
                  <dd>
                    {deliveryFee === 0 ? (
                      <span className="font-semibold text-emerald-600">FREE</span>
                    ) : (
                      <span className="font-semibold text-slate-900">{formatCurrency(deliveryFee)}</span>
                    )}
                  </dd>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-bold text-slate-950">
                  <dt>Total Payable</dt>
                  <dd className="text-lg text-teal-800">{formatCurrency(finalTotal)}</dd>
                </div>
              </dl>

              {/* Place Order CTA Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={submitting || uploadingPrescription}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.99]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Confirming Order...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Confirm & Place Order
                    </>
                  )}
                </button>
              </div>

              {/* Security Badges */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="h-4 w-4 text-teal-700" />
                <span>256-bit SSL Encrypted Healthcare Checkout</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
