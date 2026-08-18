'use client';
import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, SlidersHorizontal, X, Star, MapPin, Clock, ChevronDown } from 'lucide-react';
import { DoctorCard } from './DoctorCard';
import { DoctorCardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { SPECIALIZATIONS } from '@/lib/utils';

const CITIES = ['Islamabad', 'Lahore', 'Karachi', 'Rawalpindi', 'Peshawar', 'Quetta', 'Faisalabad', 'Multan'];
const LANGUAGES = ['Urdu', 'English', 'Punjabi', 'Sindhi', 'Pashto'];

export function DoctorsClient({ initialData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    spec: searchParams.get('spec') || '',
    city: searchParams.get('city') || '',
    gender: searchParams.get('gender') || '',
    minRating: searchParams.get('minRating') || '0',
    maxFee: searchParams.get('maxFee') || '99999',
    minExp: searchParams.get('minExp') || '0',
    lang: searchParams.get('lang') || '',
    sort: searchParams.get('sort') || 'rating',
  });

  const updateURL = useCallback((newFilters, query = searchQuery) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    Object.entries(newFilters).forEach(([k, v]) => { if (v && v !== '0' && v !== '99999') params.set(k, v); });
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateURL(filters, searchQuery);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    setFilters({ spec: '', city: '', gender: '', minRating: '0', maxFee: '99999', minExp: '0', lang: '', sort: 'rating' });
    setSearchQuery('');
    router.push(pathname);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '0' && v !== '99999' && v !== 'rating').length;

  const { doctors, total, pages, page } = initialData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black font-heading text-gray-900 dark:text-white mb-2">
            Find Your <span className="gradient-text">Doctor</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{total} verified doctors available</p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, specialization, hospital..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sort By</label>
                <select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="rating">Top Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="fee_asc">Fee: Low to High</option>
                  <option value="fee_desc">Fee: High to Low</option>
                </select>
              </div>

              {/* Specialization */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Specialization</label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {(SPECIALIZATIONS || []).map(s => (
                    <button key={s.name} onClick={() => handleFilterChange('spec', filters.spec === s.name ? '' : s.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        filters.spec === s.name ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}>
                      {s.icon} {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">City</label>
                <select value={filters.city} onChange={e => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Cities</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Gender */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                <div className="flex gap-2">
                  {['', 'male', 'female'].map(g => (
                    <button key={g} onClick={() => handleFilterChange('gender', g)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors border ${
                        filters.gender === g ? 'border-primary-400 bg-primary-50 dark:bg-primary-950 text-primary-700' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50'
                      }`}>
                      {g === '' ? 'Any' : g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Rating */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Min Rating: {filters.minRating}★</label>
                <input type="range" min="0" max="5" step="0.5" value={filters.minRating}
                  onChange={e => handleFilterChange('minRating', e.target.value)}
                  className="w-full accent-primary-600" />
              </div>

              {/* Max Fee */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Max Fee: PKR {parseInt(filters.maxFee) === 99999 ? '∞' : parseInt(filters.maxFee).toLocaleString()}
                </label>
                <input type="range" min="500" max="10000" step="500" value={Math.min(parseInt(filters.maxFee), 10000)}
                  onChange={e => handleFilterChange('maxFee', e.target.value)}
                  className="w-full accent-primary-600" />
              </div>

              {/* Min Experience */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Min Experience: {filters.minExp}y+</label>
                <input type="range" min="0" max="30" step="1" value={filters.minExp}
                  onChange={e => handleFilterChange('minExp', e.target.value)}
                  className="w-full accent-primary-600" />
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{doctors.length}</span> of{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{total}</span> doctors
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Doctor Grid */}
            {doctors.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No doctors found</h3>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your search filters</p>
                <button onClick={clearFilters} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">Clear Filters</button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-4'}>
                {doctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} viewMode={viewMode} />)}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => updateURL(filters)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                      p === page ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
