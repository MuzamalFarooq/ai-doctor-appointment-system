'use client';

import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import toast from 'react-hot-toast';

export function AddToCartButton({ medicine, className = '', variant = 'primary' }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const isOutOfStock = typeof medicine.stock === 'number' && medicine.stock <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('This product is currently out of stock.');
      return;
    }

    const res = addItem(medicine, 1);
    if (res.success) {
      toast.success(`${medicine.name} added to cart!`);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      toast.error(res.message);
    }
  };

  if (isOutOfStock) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-400 cursor-not-allowed ${className}`}
      >
        Out of Stock
      </button>
    );
  }

  if (variant === 'details') {
    return (
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={handleAdd}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition active:scale-[0.98] ${className}`}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            handleAdd(new MouseEvent('click'));
            openCart();
          }}
          className="inline-flex items-center justify-center rounded-xl border border-teal-700 bg-teal-50/50 px-5 py-3.5 text-sm font-semibold text-teal-800 hover:bg-teal-100/60 transition"
        >
          Buy Now
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition active:scale-95 ${className}`}
    >
      {added ? (
        <>
          <Check className="h-3.5 w-3.5" /> Added
        </>
      ) : (
        <>
          <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
        </>
      )}
    </button>
  );
}
