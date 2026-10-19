import Link from 'next/link';
import { z } from 'zod';
import { excludeDemoData } from '@/lib/demo-data';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Search } from 'lucide-react';

export const metadata = {
  title: 'Medicine and Healthcare Product Catalog',
  description: 'Browse medicine and healthcare product catalog records. Pharmacy sales and fulfillment are not currently available.',
};

const querySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  category: z.string().trim().max(80).optional().default(''),
  page: z.coerce.number().int().min(1).max(100).default(1),
});

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MedicinesPage({ searchParams }) {
  const raw = await searchParams;
  const parsed = querySchema.safeParse(Object.fromEntries(Object.entries(raw || {}).map(([key, value]) => [key, first(value)])));
  const { q, category, page } = parsed.success ? parsed.data : querySchema.parse({});
  const take = 12;
  let products = [];
  let total = 0;
  let categories = [];
  let loadError = false;
  const showDemoCatalog = process.env.NODE_ENV === 'development';

  try {
    const baseWhere = {
      isActive: true,
      ...(q && { name: { contains: q, mode: 'insensitive' } }),
      ...(category && { category }),
    };
    const where = showDemoCatalog ? baseWhere : excludeDemoData(baseWhere);
    const baseCategoryWhere = { isActive: true };
    [products, total, categories] = await Promise.all([
      prisma.medicineProduct.findMany({
        where,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        skip: (page - 1) * take,
        take,
      }),
      prisma.medicineProduct.count({ where }),
      prisma.medicineProduct.findMany({
        where: showDemoCatalog ? baseCategoryWhere : excludeDemoData(baseCategoryWhere),
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
    ]);
  } catch (error) {
    console.error('Medicine catalog could not be loaded:', error);
    loadError = true;
  }

  const pageCount = Math.ceil(total / take);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-[#f1f8f7]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-800">Catalog</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Medicines and healthcare products</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">Browse the catalog records currently available in this environment.</p>
          <div role="note" className="mt-6 max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            {showDemoCatalog
              ? 'This development view may include demonstration records; they are not pharmacy inventory, medical advice, or confirmed product listings.'
              : 'Catalog records are informational only; verify product details, prices, and stock with a pharmacy.'} No cart, prescription verification, checkout, or delivery service is connected.
          </div>
          <form action="/medicines" className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-[1fr_220px_auto]">
            <label className="sr-only" htmlFor="medicine-search">Search products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="medicine-search" name="q" type="search" defaultValue={q} placeholder="Search product catalog" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
            </div>
            <label className="sr-only" htmlFor="medicine-category">Filter by category</label>
            <select id="medicine-category" name="category" defaultValue={category} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20">
              <option value="">All categories</option>
              {categories.map(item => <option key={item.category} value={item.category}>{item.category}</option>)}
            </select>
            <button type="submit" className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">Search</button>
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loadError ? (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">The product catalog could not be loaded. Please try again later.</p>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">No products match this search.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600">{total} catalog {total === 1 ? 'entry' : 'entries'}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map(product => (
                <article key={product.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">{product.category}</span>
                    {product.demoData && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900">Demo</span>}
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-950">{product.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{product.description}</p>
                  <p className="mt-4 text-sm font-semibold text-slate-900">{product.demoData ? 'Demonstration estimate' : 'Listed price'}: {formatCurrency(product.price)}</p>
                  <p className="mt-1 text-xs text-slate-500">{product.demoData ? 'Not a pharmacy price · not available for purchase' : product.stock > 0 ? `${product.stock} listed units · checkout unavailable` : 'Out of stock · checkout unavailable'}</p>
                  <Link href={`/medicines/${product.id}`} className="mt-3 inline-flex items-center justify-center rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50">
                    View catalog record
                  </Link>
                </article>
              ))}
            </div>
            {pageCount > 1 && (
              <nav aria-label="Catalog pages" className="mt-8 flex justify-center gap-2">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => {
                  const params = new URLSearchParams();
                  if (q) params.set('q', q);
                  if (category) params.set('category', category);
                  params.set('page', String(number));
                  return <Link key={number} aria-current={number === page ? 'page' : undefined} href={`/medicines?${params}`} className={`rounded-lg px-3 py-2 text-sm ${number === page ? 'bg-teal-700 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>{number}</Link>;
                })}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
