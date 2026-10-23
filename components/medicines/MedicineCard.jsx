import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';
import { ShieldAlert, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

export function MedicineCard({ product }) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const displayName = product.name?.replace(/\bDEMO\b\s*/gi, '') || product.name;

  return (
    <article className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-teal-300 hover:shadow-md">
      <div>
        {/* Thumbnail & Badges */}
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={displayName}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-teal-800 p-4">
              <span className="text-2xl font-black opacity-40">RX</span>
              <span className="mt-1 text-xs font-semibold text-slate-500">
                {product.dosageForm || 'Medicine'}
              </span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 items-start">
            {product.prescriptionRequired && (
              <span
                title="Prescription Required"
                className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
              >
                <ShieldAlert className="h-3 w-3" /> Rx Required
              </span>
            )}
            {hasDiscount && (
              <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="absolute right-2.5 top-2.5">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                <AlertTriangle className="h-3 w-3" /> Only {product.stock} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                <CheckCircle2 className="h-3 w-3" /> In Stock
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800">
              {product.category}
            </span>
            {product.dosageForm && (
              <span className="text-[11px] text-slate-500">
                {product.dosageForm} {product.strength ? `· ${product.strength}` : ''}
              </span>
            )}
          </div>

          <h3 className="mt-2 text-base font-bold text-slate-950 line-clamp-1 group-hover:text-teal-800 transition">
            <Link href={`/medicines/${product.id}`}>{displayName}</Link>
          </h3>

          {product.genericName && (
            <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
              Generic: <span className="text-slate-700 font-medium">{product.genericName}</span>
            </p>
          )}

          {product.brand && product.brand !== product.name && (
            <p className="text-[11px] text-slate-400 line-clamp-1">Brand: {product.brand}</p>
          )}

          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="mt-5 border-t border-slate-100 pt-3.5">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-teal-900">
            {formatCurrency(hasDiscount ? product.discountPrice : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
          {product.packageSize && (
            <span className="text-[11px] text-slate-400 ml-auto truncate max-w-[120px]">
              {product.packageSize}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/medicines/${product.id}`}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Eye className="h-3.5 w-3.5" /> Details
          </Link>
          <AddToCartButton medicine={product} />
        </div>
      </div>
    </article>
  );
}
