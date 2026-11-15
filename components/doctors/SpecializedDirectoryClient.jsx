'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, Filter, MapPin, Clock, Star, CheckCircle, Video, 
  Building2, Calendar, Stethoscope, ChevronRight, ArrowUpDown,
  HeartPulse, Smile, Activity, Brain, Microscope, Eye, Bone, Baby, Wind, Scissors, Sparkles
} from 'lucide-react';
import { DOCTOR_SPECIALTIES, getSpecialtyMeta, normalizeSpecialty } from '@/lib/doctor-specialties';
import { formatCurrency } from '@/lib/utils';
import { RatingStars } from '@/components/ui/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

const SPECIALTY_ICONS = {
  HeartPulse,
  Smile,
  Activity,
  Stethoscope,
  Scissors,
  Brain,
  Microscope,
  Eye,
  Bone,
  Baby,
  Wind,
};

export function SpecializedDirectoryClient({ doctors = [], specialties = [] }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [consultationType, setConsultationType] = useState('ALL'); // ALL, video, in-person
  const [sortBy, setSortBy] = useState('rating'); // rating, experience, fee_asc, fee_desc

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const param = params.get('specialty') || params.get('spec') || params.get('department') || params.get('specialization');
      if (param) {
        const canonical = normalizeSpecialty(param);
        setSelectedSpecialty(canonical);
      }
    }
  }, []);

  // Available unique cities
  const cities = useMemo(() => {
    const set = new Set();
    doctors.forEach(d => {
      if (d.city && !d.city.toLowerCase().includes('demo')) {
        set.add(d.city.trim());
      }
    });
    return Array.from(set).sort();
  }, [doctors]);

  // Filtered and sorted doctors
  const filteredDoctors = useMemo(() => {
    return doctors
      .filter(doc => {
        // Specialty filter
        if (selectedSpecialty !== 'ALL') {
          const canonicalDocSpec = normalizeSpecialty(doc.specialization);
          if (canonicalDocSpec !== selectedSpecialty) return false;
        }

        // Search query (doctor name, specialty, qualifications, city, location)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const name = (doc.user?.name || '').toLowerCase();
          const spec = (doc.specialization || '').toLowerCase();
          const city = (doc.city || '').toLowerCase();
          const hospital = (doc.location || doc.hospital?.name || '').toLowerCase();
          const degrees = Array.isArray(doc.degree) ? doc.degree.join(' ').toLowerCase() : '';
          if (!name.includes(q) && !spec.includes(q) && !city.includes(q) && !hospital.includes(q) && !degrees.includes(q)) {
            return false;
          }
        }

        // City filter
        if (cityFilter !== 'ALL' && doc.city?.toLowerCase() !== cityFilter.toLowerCase()) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'fee_asc') return (a.consultationFee || 0) - (b.consultationFee || 0);
        if (sortBy === 'fee_desc') return (b.consultationFee || 0) - (a.consultationFee || 0);
        if (sortBy === 'experience') return (b.experience || 0) - (a.experience || 0);
        // Default: rating desc
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [doctors, selectedSpecialty, searchQuery, cityFilter, consultationType, sortBy]);

  // Doctor count per specialty
  const specialtyCounts = useMemo(() => {
    const map = new Map();
    doctors.forEach(doc => {
      const canonical = normalizeSpecialty(doc.specialization);
      map.set(canonical, (map.get(canonical) || 0) + 1);
    });
    return map;
  }, [doctors]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-white/10 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> 18 Medical Specialties • Verified Practitioners
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-white mb-4">
            Find & Book Top <span className="text-emerald-300">Specialist Doctors</span>
          </h1>
          <p className="max-w-2xl mx-auto text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Browse verified medical specialists across 18 clinical departments. Compare qualifications, view authentic reviews, and reserve in-person or video appointments.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-900 p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-white/20 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name, specialty, condition, hospital..."
                className="w-full pl-11 pr-4 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="px-3 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none"
              >
                <option value="ALL">All Cities</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none"
              >
                <option value="rating">Top Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee_asc">Fee: Low to High</option>
                <option value="fee_desc">Fee: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Specialties Horizontal Strip / Navigation */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-[#D1FAE5] dark:border-emerald-950/60 shadow-lg shadow-green-950/5 p-4 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-heading text-gray-900 dark:text-white">Medical Specialties</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select a specialty to view available certified doctors</p>
            </div>
            {selectedSpecialty !== 'ALL' && (
              <button
                onClick={() => setSelectedSpecialty('ALL')}
                className="text-xs font-semibold text-green-700 dark:text-green-400 hover:underline"
              >
                View All Specialties
              </button>
            )}
          </div>

          {/* Specialty Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
            <button
              onClick={() => setSelectedSpecialty('ALL')}
              className={`p-3 rounded-2xl text-left transition-all border ${
                selectedSpecialty === 'ALL'
                  ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20'
                  : 'bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope className="w-4 h-4" />
                <span className="text-xs font-bold truncate">All Doctors</span>
              </div>
              <span className={`text-[11px] block font-medium ${selectedSpecialty === 'ALL' ? 'text-green-100' : 'text-gray-400'}`}>
                {doctors.length} Doctors
              </span>
            </button>

            {DOCTOR_SPECIALTIES.map(spec => {
              const count = specialtyCounts.get(spec.name) || 0;
              const IconComponent = SPECIALTY_ICONS[spec.iconName] || Stethoscope;
              const isSelected = selectedSpecialty === spec.name;

              return (
                <button
                  key={spec.name}
                  onClick={() => setSelectedSpecialty(spec.name)}
                  className={`p-3 rounded-2xl text-left transition-all border ${
                    isSelected
                      ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20'
                      : 'bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-green-600'}`} />
                    <span className="text-xs font-bold truncate">{spec.name}</span>
                  </div>
                  <span className={`text-[11px] block font-medium ${isSelected ? 'text-green-100' : 'text-gray-400'}`}>
                    {count} {count === 1 ? 'Doctor' : 'Doctors'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Specialty Banner (when specific specialty selected) */}
        {selectedSpecialty !== 'ALL' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Department</span>
              </div>
              <h2 className="text-2xl font-black font-heading text-emerald-950 dark:text-emerald-100">
                {selectedSpecialty} Specialists
              </h2>
              <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                {getSpecialtyMeta(selectedSpecialty).description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                {filteredDoctors.length} Specialists Available
              </span>
            </div>
          </div>
        )}

        {/* Doctor Listings Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Showing <span className="text-green-700 dark:text-green-400 font-bold">{filteredDoctors.length}</span> doctors
            </p>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center">
              <Stethoscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No doctors match your criteria</h3>
              <p className="text-sm text-gray-500 mt-1">Try resetting your search query or choosing another specialty.</p>
              <button
                onClick={() => { setSelectedSpecialty('ALL'); setSearchQuery(''); setCityFilter('ALL'); }}
                className="mt-4 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doctor => {
                const photo = doctor.profilePhoto || doctor.user?.image;
                const hospital = doctor.location || doctor.hospital?.name;

                return (
                  <motion.div
                    key={doctor.id}
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl border border-[#D1FAE5] dark:border-emerald-950/60 overflow-hidden shadow-xs hover:shadow-xl hover:border-green-300 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Banner with Specialty tag */}
                      <div className="h-2 bg-gradient-to-r from-green-600 to-emerald-500" />
                      
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          {/* Doctor Avatar */}
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-emerald-50 dark:bg-emerald-950 flex-shrink-0 border-2 border-emerald-100 dark:border-emerald-900 shadow-inner">
                            {photo ? (
                              <Image
                                src={photo}
                                alt={doctor.user?.name || 'Doctor'}
                                fill
                                sizes="80px"
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-emerald-800 text-white">
                                <Stethoscope className="w-8 h-8" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
                                {doctor.user?.name}
                              </h3>
                              {doctor.isVerified && (
                                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" title="PMDC Verified" />
                              )}
                            </div>
                            <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs mt-0.5">
                              {doctor.specialization}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs truncate mt-0.5">
                              {Array.isArray(doctor.degree) && doctor.degree.length > 0
                                ? doctor.degree.join(', ')
                                : 'MBBS, FCPS'}
                            </p>

                            {/* Ratings */}
                            <div className="flex items-center gap-1.5 mt-2">
                              <RatingStars rating={doctor.rating || 5} size="xs" />
                              <span className="text-xs font-bold text-gray-900 dark:text-white">
                                {(doctor.rating || 5).toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({doctor.totalReviews || 25})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Hospital & Location */}
                        {hospital && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 mb-2">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{hospital}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800 mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{doctor.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{doctor.experience}y experience</span>
                          </div>
                        </div>

                        {/* Consultation Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 text-[11px] font-medium rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> In-Person Clinic
                          </span>
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-[11px] font-medium rounded-full flex items-center gap-1">
                            <Video className="w-3 h-3 text-blue-500" /> Video Consult
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer with Fee & Actions */}
                    <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase font-semibold">Consultation</p>
                        <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-base">
                          {formatCurrency(doctor.consultationFee || 2000)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/doctors/${doctor.id}`}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-2xs"
                        >
                          Profile
                        </Link>
                        <Link
                          href={`/doctors/${doctor.id}?action=book`}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20 transition-all flex items-center gap-1"
                        >
                          Book Now <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default SpecializedDirectoryClient;
