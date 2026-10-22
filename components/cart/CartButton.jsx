'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

export function CartButton({ className = '' }) {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCount = mounted ? items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open shopping cart with ${totalCount} items`}
      className={`relative flex items-center justify-center rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 hover:text-teal-800 ${className}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {mounted && totalCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
          {totalCount > 99 ? '99+' : totalCount}
        </span>
      )}
    </button>
  );
}
