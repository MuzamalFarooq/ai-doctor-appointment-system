'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  FileText,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        closeCart();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  if (!mounted || !isOpen) return null;

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.effectivePrice * item.quantity, 0);
  const deliveryFee = subtotal > 0 && subtotal < 2000 ? 150 : 0;
  const finalTotal = subtotal + deliveryFee;
  const hasPrescription = items.some((item) => item.prescriptionRequired);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
          className="flex w-screen max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 id="cart-drawer-title" className="text-lg font-bold text-slate-900">
                  Medicine Cart
                </h2>
                <p className="text-xs text-slate-500">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-teal-600">
                  <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">Your cart is empty</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-xs">
                  Browse our certified pharmacy catalog to add genuine healthcare medicines and supplies.
                </p>
                <Link
                  href="/medicines"
                  onClick={closeCart}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition"
                >
                  Browse Medicines <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {hasPrescription && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs leading-5 text-amber-900">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-950">Prescription Required</p>
                      <p>
                        Your cart contains prescription medicines (marked with Rx). You will be prompted to attach a valid doctor prescription during checkout.
                      </p>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <article key={item.id} className="py-4 flex gap-4">
                      {/* Image / Icon */}
                      <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
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
                            className="absolute bottom-1 right-1 rounded-md bg-amber-600 px-1 py-0.5 text-[9px] font-black uppercase text-white shadow-xs"
                          >
                            Rx
                          </span>
                        )}
                      </div>

                      {/* Info & Controls */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {item.genericName && (
                            <p className="text-xs text-slate-500 line-clamp-1">{item.genericName}</p>
                          )}
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="font-semibold text-teal-800">
                              {formatCurrency(item.effectivePrice)}
                            </span>
                            {item.discountPrice && item.discountPrice < item.price && (
                              <span className="text-slate-400 line-through text-[11px]">
                                {formatCurrency(item.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-8 text-center text-xs font-semibold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              aria-label="Increase quantity"
                              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            {formatCurrency(item.effectivePrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-slate-400 hover:text-rose-600 transition underline underline-offset-4"
                  >
                    Clear cart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/60 p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="font-semibold text-emerald-600">FREE</span>
                    ) : (
                      formatCurrency(deliveryFee)
                    )}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-[11px] text-teal-700">
                    Add {formatCurrency(2000 - subtotal)} more for free delivery!
                  </p>
                )}
                <div className="border-t border-slate-200/60 pt-2 flex justify-between font-bold text-base text-slate-950">
                  <span>Total</span>
                  <span className="text-teal-800">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  View Full Cart Page
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
