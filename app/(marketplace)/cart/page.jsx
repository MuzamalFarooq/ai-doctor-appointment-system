'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  Truck,
  ShieldCheck,
  PackageCheck,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent" />
      </div>
    );
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.effectivePrice * item.quantity, 0);
  const originalSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = Math.max(0, originalSubtotal - subtotal);
  const deliveryFee = subtotal > 0 && subtotal < 2000 ? 150 : 0;
  const finalTotal = subtotal + deliveryFee;
  const hasPrescription = items.some((item) => item.prescriptionRequired);

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/medicines"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-900 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
            </Link>
            <h1 className="mt-2 text-2xl sm:text-3xl font-heading font-bold text-slate-950">
              Shopping Cart
            </h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-4"
            >
              Clear Entire Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs max-w-2xl mx-auto my-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
              <ShoppingBag className="h-12 w-12 stroke-[1.5]" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-950">Your cart is empty</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              You haven&apos;t added any medicines or healthcare items to your cart yet. Explore our verified pharmacy catalog.
            </p>
            <div className="mt-8">
              <Link
                href="/medicines"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition"
              >
                Explore Medicines Catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left Column: Cart Items */}
            <div className="space-y-4 lg:col-span-8">
              {hasPrescription && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">
                      Prescription Required for Dispensing
                    </p>
                    <p className="mt-0.5">
                      Your order contains prescription medicines (identified by the <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">Rx</span> badge). You will be asked to upload an authorized prescription or select one from your MediConnect profile during checkout.
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/50 flex justify-between">
                  <span>Product Details ({totalCount} items)</span>
                  <span className="hidden sm:inline">Subtotal</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <article key={item.id} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      <div className="flex gap-4 items-center flex-1">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-teal-700 font-bold text-xs uppercase text-center p-1">
                              {item.dosageForm || 'Med'}
                            </div>
                          )}
                          {item.prescriptionRequired && (
                            <span
                              title="Prescription Required"
                              className="absolute top-1 right-1 rounded-md bg-amber-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-xs"
                            >
                              Rx
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-800">
                              {item.category}
                            </span>
                            {item.dosageForm && (
                              <span className="text-xs text-slate-500">
                                {item.dosageForm} {item.strength ? `· ${item.strength}` : ''}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 text-base font-bold text-slate-950">
                            <Link href={`/medicines/${item.id}`} className="hover:text-teal-700 transition">
                              {item.name}
                            </Link>
                          </h3>
                          {item.genericName && (
                            <p className="text-xs text-slate-500">Generic: {item.genericName}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-teal-800">
                              {formatCurrency(item.effectivePrice)}
                            </span>
                            {item.discountPrice && item.discountPrice < item.price && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatCurrency(item.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:justify-end">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-9 text-center text-sm font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <p className="text-sm font-bold text-slate-950">
                            {formatCurrency(item.effectivePrice * item.quantity)}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-950">Order Summary</h2>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <dt>Subtotal ({totalCount} items)</dt>
                    <dd className="font-semibold text-slate-950">{formatCurrency(subtotal)}</dd>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <dt>Discounts & Savings</dt>
                      <dd className="font-semibold">- {formatCurrency(savings)}</dd>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <dt>Estimated Delivery</dt>
                    <dd>
                      {deliveryFee === 0 ? (
                        <span className="font-semibold text-emerald-600">FREE</span>
                      ) : (
                        <span className="font-semibold text-slate-950">{formatCurrency(deliveryFee)}</span>
                      )}
                    </dd>
                  </div>

                  {deliveryFee > 0 && (
                    <div className="rounded-xl bg-teal-50/70 p-2.5 text-xs text-teal-800 leading-relaxed">
                      💡 Add <span className="font-bold">{formatCurrency(2000 - subtotal)}</span> more of eligible products to enjoy <span className="font-bold">FREE Delivery</span>!
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-4 flex justify-between text-base font-bold text-slate-950">
                    <dt>Total Amount</dt>
                    <dd className="text-xl font-bold text-teal-800">{formatCurrency(finalTotal)}</dd>
                  </div>
                </dl>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/checkout"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition"
                  >
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/medicines"
                    className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Pharmacy Assurances */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2.5 text-slate-900 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>100% Genuine & Authentic Medicines</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-900 font-semibold">
                  <Truck className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>Temperature-Controlled Packaging</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-900 font-semibold">
                  <PackageCheck className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>Licensed Pharmacist Verification</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
