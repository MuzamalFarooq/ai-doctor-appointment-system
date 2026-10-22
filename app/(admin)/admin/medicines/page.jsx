import Link from 'next/link';
import { getAdminMedicines } from '@/actions/medicine-inventory.actions';
import { MedicineInventoryClient } from '@/components/admin/MedicineInventoryClient';
import {
  Pill,
  Layers,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  Filter,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export const metadata = {
  title: 'Medicine Inventory & Catalog | Admin Dashboard',
  description: 'Manage pharmaceutical inventory, batch allocations, stock thresholds, and clinical pricing.',
};

export default async function AdminMedicinesPage({ searchParams }) {
  const rawParams = await searchParams;
  const q = rawParams?.q || '';
  const category = rawParams?.category || 'all';
  const stockFilter = rawParams?.stockFilter || 'all';
  const page = parseInt(rawParams?.page || '1', 10);
  const limit = 20;

  const res = await getAdminMedicines({
    q,
    category,
    stockFilter,
    page,
    limit,
  });

  const medicines = res.success ? res.medicines : [];
  const categories = res.success ? res.categories : [];
  const total = res.success ? res.total : 0;
  const totalCount = res.success ? res.totalCount : 0;
  const lowStockCount = res.success ? res.lowStockCount : 0;
  const outOfStockCount = res.success ? res.outOfStockCount : 0;
  const pageCount = res.success ? res.pageCount : 1;

  const activeInStockCount = Math.max(0, totalCount - outOfStockCount);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-950 dark:text-white flex items-center gap-2.5">
            <Pill className="h-7 w-7 text-teal-600" /> Medicine Inventory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time pharmaceutical catalog management, batch allocations, stock monitoring, and drug specifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/medicine-orders"
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
          >
            Manage Orders
          </Link>
          <Link
            href="/medicines"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-800 shadow-xs transition"
          >
            Public Catalog <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Catalog</span>
            <Layers className="h-4 w-4 text-teal-600" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">All registered medicines</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
            <span>In Stock</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-emerald-900 dark:text-emerald-300">
            {activeInStockCount}
          </p>
          <p className="mt-1 text-xs text-emerald-700/80">Available for checkout</p>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-bold uppercase">
            <span>Low Stock</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-amber-900 dark:text-amber-300">
            {lowStockCount}
          </p>
          <p className="mt-1 text-xs text-amber-700/80">15 or fewer units remaining</p>
        </div>

        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-bold uppercase">
            <span>Out of Stock</span>
            <XCircle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-rose-900 dark:text-rose-300">
            {outOfStockCount}
          </p>
          <p className="mt-1 text-xs text-rose-700/80">Replenishment required</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <form method="GET" className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by name, generic name, brand, or SKU..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <select
              name="category"
              defaultValue={category}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 py-2.5 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <select
              name="stockFilter"
              defaultValue={stockFilter}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 py-2.5 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock (≤ 15)</option>
              <option value="out">Out of Stock (0)</option>
            </select>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 shadow-xs transition"
            >
              <Filter className="h-3.5 w-3.5" />
            </button>
            {(q || category !== 'all' || stockFilter !== 'all') && (
              <Link
                href="/admin/medicines"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Reset filters"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Inventory Table & Modals Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        {medicines.length === 0 ? (
          <div className="py-16 text-center">
            <Pill className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              No medicines match your query
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search criteria, category selection, or stock filters.
            </p>
          </div>
        ) : (
          <>
            <MedicineInventoryClient medicines={medicines} categories={categories} />

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-xs text-slate-500">
                  Showing <span className="font-bold">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-bold">{Math.min(page * limit, total)}</span> of{' '}
                  <span className="font-bold">{total}</span> medicines
                </p>
                <div className="flex items-center gap-2">
                  {page > 1 ? (
                    <Link
                      href={`/admin/medicines?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&stockFilter=${encodeURIComponent(stockFilter)}&page=${page - 1}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    >
                      Previous
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 dark:text-slate-700 cursor-not-allowed"
                    >
                      Previous
                    </button>
                  )}

                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-2">
                    Page {page} of {pageCount}
                  </span>

                  {page < pageCount ? (
                    <Link
                      href={`/admin/medicines?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&stockFilter=${encodeURIComponent(stockFilter)}&page=${page + 1}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    >
                      Next
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 dark:text-slate-700 cursor-not-allowed"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
