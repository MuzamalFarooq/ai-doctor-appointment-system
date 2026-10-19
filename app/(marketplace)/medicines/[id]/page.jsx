import Link from 'next/link';
import { notFound } from 'next/navigation';
import { excludeDemoData } from '@/lib/demo-data';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await prisma.medicineProduct.findFirst({
    where: process.env.NODE_ENV === 'development'
      ? { id, isActive: true }
      : excludeDemoData({ id, isActive: true }),
    select: { name: true, demoData: true },
  });
  return { title: product ? `${product.name} | ${product.demoData ? 'Demo catalog' : 'Product catalog'}` : 'Product not found' };
}

export default async function MedicineDetailPage({ params }) {
  const { id } = await params;
  const product = await prisma.medicineProduct.findFirst({
    where: process.env.NODE_ENV === 'development'
      ? { id, isActive: true }
      : excludeDemoData({ id, isActive: true }),
  });
  if (!product) notFound();

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <Link href="/medicines" className="text-sm font-semibold text-teal-800 hover:underline">← Back to catalog</Link>
      <article className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">{product.category}</span>
          {product.demoData && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">Development demo</span>}
        </div>
        <h1 className="mt-5 font-heading text-3xl font-bold text-slate-950">{product.name}</h1>
        <p className="mt-4 leading-7 text-slate-600">{product.description}</p>
        <dl className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Generic name</dt><dd className="mt-1 text-slate-900">{product.genericName || 'Not provided'}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Brand</dt><dd className="mt-1 text-slate-900">{product.brand || 'Not provided'}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Form / strength</dt><dd className="mt-1 text-slate-900">{[product.dosageForm, product.strength].filter(Boolean).join(' · ') || 'Not provided'}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Package size</dt><dd className="mt-1 text-slate-900">{product.packageSize || 'Not provided'}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seller</dt><dd className="mt-1 text-slate-900">{product.sellerName || 'Not provided'}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inventory</dt><dd className="mt-1 text-slate-900">Not available for purchase</dd></div>
        </dl>
        <p role="note" className="mt-7 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          {product.demoData
            ? 'Demonstration catalog data only. This record does not represent verified pharmacy stock, a real product listing, or a medication recommendation.'
            : 'Catalog information is not a medication recommendation. Confirm product details and stock with a pharmacy.'} Cart, prescription verification, payment, and delivery integrations are not configured.
        </p>
      </article>
    </section>
  );
}
