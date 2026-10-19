import { z } from 'zod';
import Link from 'next/link';
import { excludeDemoData } from '@/lib/demo-data';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Search } from 'lucide-react';

export const metadata = {
  title: 'Laboratory Test Catalog',
  description: 'Browse laboratory test catalog records. Laboratory bookings and collection are not currently available.',
};

const querySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  category: z.string().trim().max(80).optional().default(''),
  sort: z.enum(['name', 'price_asc', 'price_desc']).default('name'),
  page: z.coerce.number().int().min(1).max(100).default(1),
});

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LabTestsPage({ searchParams }) {
  const raw = await searchParams;
  const parsed = querySchema.safeParse(Object.fromEntries(Object.entries(raw || {}).map(([key, value]) => [key, first(value)])));
  const { q, category, sort, page } = parsed.success ? parsed.data : querySchema.parse({});
  let tests = [];
  let categories = [];
  let total = 0;
  let loadError = false;
  const showDemoCatalog = process.env.NODE_ENV === 'development';
  const take = 12;

  try {
    const baseWhere = {
      isActive: true,
      ...(q && { name: { contains: q, mode: 'insensitive' } }),
      ...(category && { category }),
    };
    const where = showDemoCatalog ? baseWhere : excludeDemoData(baseWhere);
    const baseCategoryWhere = { isActive: true };
    const orderBy = sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
        : [{ category: 'asc' }, { name: 'asc' }];
    [tests, categories, total] = await Promise.all([
      prisma.labTest.findMany({ where, orderBy, skip: (page - 1) * take, take }),
      prisma.labTest.findMany({
        where: showDemoCatalog ? baseCategoryWhere : excludeDemoData(baseCategoryWhere),
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
      prisma.labTest.count({ where }),
    ]);
  } catch (error) {
    console.error('Laboratory test catalog could not be loaded:', error);
    loadError = true;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-[#f1f8f7]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-800">Catalog</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Laboratory tests</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">Explore the test catalog records currently available in this environment.</p>
          <div role="note" className="mt-6 max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            {showDemoCatalog
              ? 'This development view may include demonstration records and does not indicate service availability.'
              : 'Catalog records are informational only; participating laboratories, verified prices, and collection coverage are not currently connected.'} Test preparation, collection, booking schedules, and results are unavailable.
          </div>
          <form action="/lab-tests" className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-[1fr_180px_180px_auto]">
            <label className="sr-only" htmlFor="test-search">Search laboratory tests</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="test-search" name="q" type="search" defaultValue={q} placeholder="Search tests" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
            </div>
            <label className="sr-only" htmlFor="test-category">Filter by category</label>
            <select id="test-category" name="category" defaultValue={category} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20">
              <option value="">All categories</option>
              {categories.map(item => <option key={item.category} value={item.category}>{item.category}</option>)}
            </select>
            <label className="sr-only" htmlFor="test-sort">Sort laboratory tests</label>
            <select id="test-sort" name="sort" defaultValue={sort} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20">
              <option value="name">Name</option>
              <option value="price_asc">Demo estimate: low to high</option>
              <option value="price_desc">Demo estimate: high to low</option>
            </select>
            <button type="submit" className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">Search</button>
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loadError ? (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">Laboratory tests could not be loaded. Please try again later.</p>
        ) : tests.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">No tests match this search.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tests.map(test => (
              <article key={test.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">{test.category}</span>
                  {test.demoData && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900">Demo</span>}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-950">{test.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{test.description}</p>
                <p className="mt-4 text-sm font-semibold text-slate-900">{test.demoData ? 'Demonstration estimate' : 'Listed price'}: {formatCurrency(test.price)}</p>
                <p className="mt-1 text-xs text-slate-500">{test.demoData ? 'Not a laboratory price · no service connected' : 'Laboratory booking unavailable'}</p>
                <p className="mt-4 text-sm font-medium text-slate-500">Booking and collection unavailable</p>
              </article>
            ))}
          </div>
        )}
        {!loadError && total > take && (
          <nav aria-label="Laboratory catalog pages" className="mt-8 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(total / take) }, (_, index) => index + 1).map(number => {
              const params = new URLSearchParams();
              if (q) params.set('q', q);
              if (category) params.set('category', category);
              if (sort !== 'name') params.set('sort', sort);
              params.set('page', String(number));
              return <Link key={number} aria-current={number === page ? 'page' : undefined} href={`/lab-tests?${params}`} className={`rounded-lg px-3 py-2 text-sm ${number === page ? 'bg-teal-700 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>{number}</Link>;
            })}
          </nav>
        )}
      </section>
    </div>
  );
}
