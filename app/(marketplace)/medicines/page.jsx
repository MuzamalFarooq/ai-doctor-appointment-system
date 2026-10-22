import Link from 'next/link';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { excludeDemoData } from '@/lib/demo-data';
import { MedicineCard } from '@/components/medicines/MedicineCard';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck,
  Truck,
  Sparkles,
  FileCheck2,
} from 'lucide-react';

export const metadata = {
  title: 'Online Pharmacy & Certified Medicines',
  description:
    'Order 100% genuine medicines, prescription drugs, vitamins, and healthcare supplies online with temperature-controlled doorstep delivery from licensed pharmacies.',
};

const querySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  category: z.string().trim().max(100).optional().default(''),
  subcategory: z.string().trim().max(100).optional().default(''),
  rx: z.enum(['all', 'otc', 'required']).optional().default('all'),
  inStock: z.enum(['all', 'yes']).optional().default('all'),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).optional().default('newest'),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).max(100).default(1),
});

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MedicinesPage({ searchParams }) {
  const raw = await searchParams;
  const parsed = querySchema.safeParse(
    Object.fromEntries(
      Object.entries(raw || {}).map(([key, value]) => [key, first(value)])
    )
  );

  const {
    q,
    category,
    subcategory,
    rx,
    inStock,
    sort,
    minPrice,
    maxPrice,
    page,
  } = parsed.success ? parsed.data : querySchema.parse({});

  const take = 12;
  let products = [];
  let total = 0;
  let categories = [];
  let currentCategoryDoc = null;
  let loadError = false;

  const showDemoCatalog = process.env.NODE_ENV === 'development';

  try {
    // Build search and filter query
    const whereConditions = {
      isActive: true,
      status: 'ACTIVE',
    };

    if (q) {
      whereConditions.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { genericName: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { activeIngredients: { hasSome: [q] } },
      ];
    }

    if (category) {
      whereConditions.category = category;
    }

    if (subcategory) {
      whereConditions.subcategory = subcategory;
    }

    if (rx === 'otc') {
      whereConditions.prescriptionRequired = false;
    } else if (rx === 'required') {
      whereConditions.prescriptionRequired = true;
    }

    if (inStock === 'yes') {
      whereConditions.stock = { gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereConditions.price = {};
      if (minPrice !== undefined) whereConditions.price.gte = minPrice;
      if (maxPrice !== undefined) whereConditions.price.lte = maxPrice;
    }

    // Determine sorting
    let orderBy = [{ createdAt: 'desc' }];
    if (sort === 'price_asc') {
      orderBy = [{ price: 'asc' }];
    } else if (sort === 'price_desc') {
      orderBy = [{ price: 'desc' }];
    } else if (sort === 'name_asc') {
      orderBy = [{ name: 'asc' }];
    }

    const where = showDemoCatalog ? whereConditions : excludeDemoData(whereConditions);

    // Fetch categories from DB
    const [fetchedProducts, fetchedTotal, fetchedCategories] = await Promise.all([
      prisma.medicineProduct.findMany({
        where,
        orderBy,
        skip: (page - 1) * take,
        take,
      }),
      prisma.medicineProduct.count({ where }),
      prisma.medicineCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: { id: true, name: true, slug: true, subcategories: true },
      }),
    ]);

    products = fetchedProducts;
    total = fetchedTotal;
    categories = fetchedCategories;

    if (category) {
      currentCategoryDoc = categories.find((c) => c.name === category);
    }
  } catch (error) {
    console.error('Medicine catalog load error:', error);
    loadError = true;
  }

  const pageCount = Math.ceil(total / take);

  // Helper to construct query params preserving existing selections
  function makeQueryUrl(overrides = {}) {
    const params = new URLSearchParams();
    const merged = {
      q,
      category,
      subcategory,
      rx,
      inStock,
      sort,
      minPrice,
      maxPrice,
      page: 1, // Reset page when filters change
      ...overrides,
    };

    Object.entries(merged).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== 'all' && !(key === 'page' && val === 1)) {
        params.set(key, String(val));
      }
    });

    const queryString = params.toString();
    return `/medicines${queryString ? `?${queryString}` : ''}`;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf6f4] via-[#f1f8f7] to-slate-50 pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-teal-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
                <Sparkles className="h-3.5 w-3.5 text-teal-700" /> MediConnect Online Pharmacy
              </span>
              <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Certified Medicines & Health Essentials
              </h1>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Purchase verified prescription & OTC medications with rapid delivery, batch-level traceability, and pharmacist verification.
              </p>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0 max-w-md">
              <div className="flex items-center gap-3 rounded-2xl border border-teal-200/60 bg-white/90 p-3.5 shadow-xs">
                <ShieldCheck className="h-6 w-6 text-teal-700 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">100% Genuine</p>
                  <p className="text-[11px] text-slate-500">Verified manufacturers</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-teal-200/60 bg-white/90 p-3.5 shadow-xs">
                <FileCheck2 className="h-6 w-6 text-teal-700 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Rx Validation</p>
                  <p className="text-[11px] text-slate-500">Safe dispensing check</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar Form */}
          <form action="/medicines" className="mt-8 grid gap-3 sm:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="medicine-search"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search by medicine name, generic salt, brand, or active ingredient..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-xs outline-none focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 transition"
              />
            </div>

            <select
              name="category"
              defaultValue={category}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-xs outline-none focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 transition cursor-pointer"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-2xl bg-teal-700 px-7 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-teal-800 transition active:scale-95"
            >
              Search Catalog
            </button>
          </form>

          {/* Fast Category Filter Chips */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Link
              href="/medicines"
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                !category
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Categories
            </Link>
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={makeQueryUrl({ category: cat.name, subcategory: '' })}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  category === cat.name
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content & Filter Sidebar */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr] items-start">
          {/* Filters Sidebar */}
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <SlidersHorizontal className="h-4 w-4 text-teal-700" /> Filters
              </span>
              {(q || category || subcategory || rx !== 'all' || inStock !== 'all' || sort !== 'newest') && (
                <Link
                  href="/medicines"
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </Link>
              )}
            </div>

            {/* Prescription Requirement Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Prescription
              </p>
              <div className="space-y-1.5 text-xs font-medium text-slate-700">
                <Link
                  href={makeQueryUrl({ rx: 'all' })}
                  className={`block rounded-lg px-2.5 py-1.5 transition ${
                    rx === 'all' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  All Medicines
                </Link>
                <Link
                  href={makeQueryUrl({ rx: 'otc' })}
                  className={`block rounded-lg px-2.5 py-1.5 transition ${
                    rx === 'otc' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  Over-the-Counter (OTC) Only
                </Link>
                <Link
                  href={makeQueryUrl({ rx: 'required' })}
                  className={`block rounded-lg px-2.5 py-1.5 transition ${
                    rx === 'required' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  Prescription Required (Rx)
                </Link>
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Stock Status
              </p>
              <div className="space-y-1.5 text-xs font-medium text-slate-700">
                <Link
                  href={makeQueryUrl({ inStock: 'all' })}
                  className={`block rounded-lg px-2.5 py-1.5 transition ${
                    inStock === 'all' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  All Statuses
                </Link>
                <Link
                  href={makeQueryUrl({ inStock: 'yes' })}
                  className={`block rounded-lg px-2.5 py-1.5 transition ${
                    inStock === 'yes' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  In Stock Only
                </Link>
              </div>
            </div>

            {/* Subcategories (if current category has any) */}
            {currentCategoryDoc?.subcategories?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Subcategory
                </p>
                <div className="space-y-1 text-xs text-slate-700 max-h-48 overflow-y-auto">
                  <Link
                    href={makeQueryUrl({ subcategory: '' })}
                    className={`block rounded-lg px-2.5 py-1.5 transition ${
                      !subcategory ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    All {currentCategoryDoc.name}
                  </Link>
                  {currentCategoryDoc.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      href={makeQueryUrl({ subcategory: sub })}
                      className={`block rounded-lg px-2.5 py-1.5 transition ${
                        subcategory === sub ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories List in Sidebar */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Categories ({categories.length})
              </p>
              <div className="space-y-1 text-xs text-slate-700 max-h-60 overflow-y-auto">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={makeQueryUrl({ category: cat.name, subcategory: '' })}
                    className={`block rounded-lg px-2.5 py-1.5 transition truncate ${
                      category === cat.name ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div>
            {/* Top Toolbar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 shadow-xs">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Showing <span className="font-bold text-slate-900">{products.length}</span> of{' '}
                <span className="font-bold text-slate-900">{total}</span> products
                {category ? ` in "${category}"` : ''}
              </p>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <Link
                    href={makeQueryUrl({ sort: 'newest' })}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                      sort === 'newest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Newest
                  </Link>
                  <Link
                    href={makeQueryUrl({ sort: 'price_asc' })}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                      sort === 'price_asc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Price: Low
                  </Link>
                  <Link
                    href={makeQueryUrl({ sort: 'price_desc' })}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                      sort === 'price_desc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Price: High
                  </Link>
                  <Link
                    href={makeQueryUrl({ sort: 'name_asc' })}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                      sort === 'name_asc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    A-Z
                  </Link>
                </div>
              </div>
            </div>

            {/* Error or Empty State */}
            {loadError ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-900">
                <p className="font-bold">Catalog could not be loaded at this moment.</p>
                <p className="mt-1 text-sm text-rose-700">Please refresh or try again in a few moments.</p>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <p className="text-lg font-bold text-slate-900">No medicines match your search criteria.</p>
                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                  Try adjusting your keywords, resetting category filters, or checking back soon as our catalog is continuously updated.
                </p>
                <div className="mt-6">
                  <Link
                    href="/medicines"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-800 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Clear All Filters
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <MedicineCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pageCount > 1 && (
                  <nav aria-label="Catalog pages" className="mt-10 flex justify-center gap-2">
                    {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                      <Link
                        key={number}
                        href={makeQueryUrl({ page: number })}
                        aria-current={number === page ? 'page' : undefined}
                        className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                          number === page
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {number}
                      </Link>
                    ))}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
