import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { excludeDemoData } from '@/lib/demo-data';
import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from '@/components/medicines/AddToCartButton';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ThermometerSnowflake,
  FileText,
  Truck,
  Sparkles,
} from 'lucide-react';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await prisma.medicineProduct.findFirst({
    where: { id, isActive: true },
    select: { name: true, genericName: true, brand: true, category: true },
  });

  if (!product) {
    return { title: 'Product Not Found | MediConnect AI' };
  }

  return {
    title: `${product.name} — Order Online | MediConnect Pharmacy`,
    description: `Buy genuine ${product.name} (${product.genericName || ''}) online with home delivery and pharmacist review.`,
  };
}

export default async function MedicineDetailPage({ params }) {
  const { id } = await params;

  const product = await prisma.medicineProduct.findFirst({
    where: { id, isActive: true },
    include: {
      batches: {
        where: { quantity: { gt: 0 } },
        orderBy: { expiryDate: 'asc' },
        take: 3,
      },
    },
  });

  if (!product) notFound();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const effectivePrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/medicines"
            className="inline-flex items-center gap-2 text-xs font-semibold text-teal-800 hover:text-teal-900 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Medicines Catalog
          </Link>
        </div>

        {/* Product Container */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            {/* Left Image & Badges */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 flex items-center justify-center shadow-xs">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-teal-800">
                    <span className="text-4xl font-black opacity-30">RX</span>
                    <span className="mt-2 text-sm font-semibold text-slate-500">
                      {product.dosageForm || 'Medicine'}
                    </span>
                  </div>
                )}

                {product.prescriptionRequired && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                    <ShieldAlert className="h-3.5 w-3.5" /> Prescription Required (Rx)
                  </span>
                )}
              </div>

              {/* Guarantees Box */}
              <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-teal-900">
                  <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>100% Genuine Pharmacy Stock</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <ThermometerSnowflake className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>Stored & transported under optimal temperature control</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Truck className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>Doorstep delivery with secure tamper-evident packaging</span>
                </div>
              </div>
            </div>

            {/* Right Information & Order Box */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {product.subcategory}
                    </span>
                  )}
                  {product.sku && (
                    <span className="text-xs text-slate-400 font-mono">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                <h1 className="mt-4 font-heading text-2xl sm:text-3xl font-extrabold text-slate-950">
                  {product.name}
                </h1>

                {product.genericName && (
                  <p className="mt-1.5 text-sm font-medium text-slate-600">
                    Generic Formula:{' '}
                    <span className="text-teal-800 font-semibold">{product.genericName}</span>
                  </p>
                )}

                {product.manufacturer && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" /> Manufactured by {product.manufacturer}
                  </p>
                )}

                {/* Pricing Block */}
                <div className="mt-6 flex items-baseline gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-3xl font-extrabold text-teal-900">
                    {formatCurrency(effectivePrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                      Save {formatCurrency(product.price - product.discountPrice)}
                    </span>
                  )}
                  {product.packageSize && (
                    <span className="ml-auto text-xs font-semibold text-slate-600">
                      {product.packageSize}
                    </span>
                  )}
                </div>

                {/* Stock Status Badge */}
                <div className="mt-4 flex items-center gap-2">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                      <AlertTriangle className="h-3.5 w-3.5" /> Out of Stock — Fulfillment Unavailable
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5" /> Low Stock: Only {product.stock} units available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> In Stock ({product.stock} units available)
                    </span>
                  )}
                </div>

                {/* Prescription Notice */}
                {product.prescriptionRequired && (
                  <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs leading-relaxed text-amber-950">
                    <p className="font-bold text-amber-900">
                      ⚠️ Prescription Required for Dispensing
                    </p>
                    <p className="mt-1">
                      In accordance with healthcare regulations, this medicine requires an authorized doctor&apos;s prescription. You can upload an image/PDF or select an existing prescription from your MediConnect account during checkout.
                    </p>
                  </div>
                )}

                {/* Add to Cart Actions */}
                <div className="mt-6">
                  <AddToCartButton medicine={product} variant="details" />
                </div>

                {/* Description */}
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Product Description
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {product.description}
                  </p>
                </div>

                {/* Specifications Grid */}
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
                    Specifications & Clinical Info
                  </h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                    <div className="border-b border-slate-50 pb-2">
                      <dt className="text-slate-400 font-medium">Dosage Form</dt>
                      <dd className="font-semibold text-slate-900 mt-0.5">{product.dosageForm || 'Not specified'}</dd>
                    </div>
                    <div className="border-b border-slate-50 pb-2">
                      <dt className="text-slate-400 font-medium">Strength</dt>
                      <dd className="font-semibold text-slate-900 mt-0.5">{product.strength || 'Standard'}</dd>
                    </div>
                    <div className="border-b border-slate-50 pb-2">
                      <dt className="text-slate-400 font-medium">Active Ingredients</dt>
                      <dd className="font-semibold text-slate-900 mt-0.5">
                        {product.activeIngredients?.length > 0
                          ? product.activeIngredients.join(', ')
                          : product.genericName || 'Not specified'}
                      </dd>
                    </div>
                    <div className="border-b border-slate-50 pb-2">
                      <dt className="text-slate-400 font-medium">Storage Instructions</dt>
                      <dd className="font-semibold text-slate-900 mt-0.5">{product.storageInstructions || 'Store below 25°C in a dry place.'}</dd>
                    </div>
                    {product.indications && (
                      <div className="sm:col-span-2 border-b border-slate-50 pb-2">
                        <dt className="text-slate-400 font-medium">Indications</dt>
                        <dd className="font-semibold text-slate-900 mt-0.5">{product.indications}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Active Batches Traceability */}
                {product.batches?.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Batch Traceability & Expiry
                    </h2>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {product.batches.map((batch) => (
                        <div
                          key={batch.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700"
                        >
                          <span className="font-semibold">Batch:</span> {batch.batchNumber} ·{' '}
                          <span className="text-slate-500">Exp: {new Date(batch.expiryDate).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory & Medical Disclaimer */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-500">
          <p className="font-bold text-slate-700">Important Healthcare Notice</p>
          <p className="mt-1">
            Medicine information provided on MediConnect AI is for educational and fulfillment purposes and is not a substitute for professional medical diagnosis or treatment. Always consult a licensed physician or pharmacist before starting any new medication.
          </p>
        </div>
      </div>
    </div>
  );
}
