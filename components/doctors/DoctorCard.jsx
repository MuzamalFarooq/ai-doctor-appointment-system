'use client';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Star, Users, ChevronRight, Heart, Video, CheckCircle, Stethoscope } from 'lucide-react';
import { RatingStars } from '@/components/ui/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

export function DoctorCard({ doctor, viewMode = 'grid' }) {
  const rawName = doctor.user?.name || 'Doctor';
  const name = rawName.replace(/\bDEMO\b\s*/gi, '');
  const city = doctor.city?.replace(/\bdemo\b\s*/gi, '').trim() || doctor.city;
  const hospital = doctor.hospital?.name;
  const photo = doctor.profilePhoto || doctor.user?.image;
  const gradients = [
    'from-green-600 to-green-800',
    'from-emerald-600 to-teal-800',
    'from-green-500 to-emerald-700',
    'from-teal-600 to-green-700',
    'from-emerald-700 to-green-900',
  ];
  const gradient = gradients[doctor.id.charCodeAt(0) % gradients.length];

  if (viewMode === 'list') {
    return (
      <motion.div whileHover={{ x: 4 }} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-[#D1FAE5] dark:border-emerald-900/40 shadow-xs hover:shadow-md hover:border-green-300 transition-all flex items-center gap-5">
        <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden shadow-xs`}>
          {photo ? <Image src={photo} alt={name} fill sizes="80px" unoptimized className="object-cover" /> : <span aria-hidden="true"><Stethoscope className="h-8 w-8 text-white" /></span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{name}</h3>
              <p className="text-green-700 dark:text-green-400 font-medium text-sm">{doctor.specialization}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{doctor.degree?.length ? doctor.degree.join(', ') : 'Qualifications not provided'}</p>
            </div>
            {doctor.isVerified && !doctor.demoData && <Badge variant="success" dot>Verified</Badge>}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-green-600" />{city}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-green-600" />{doctor.experience}y exp</span>
            {!doctor.demoData && doctor.totalReviews > 0 && <><RatingStars rating={doctor.rating} size="xs" /><span>({doctor.totalReviews} reviews)</span></>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">Consultation</p>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{doctor.demoData ? 'Not a real fee' : formatCurrency(doctor.consultationFee)}</p>
          <Link href={`/doctors/${doctor.id}`} className="mt-2 inline-block px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 shadow-xs transition-colors">
            View profile
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-[#D1FAE5] dark:border-emerald-900/40 overflow-hidden shadow-xs hover:shadow-md hover:border-green-300 transition-all duration-300">
      {/* Top Gradient Bar */}
      <div className="h-1.5 bg-gradient-to-r from-green-500 via-green-600 to-green-700" />
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden shadow-xs`}>
            {photo ? <Image src={photo} alt={name} fill sizes="64px" unoptimized className="object-cover" /> : <Stethoscope className="h-7 w-7 text-white" />}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{name}</h3>
              {doctor.isVerified && !doctor.demoData && (
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-green-700 dark:text-green-400 text-xs font-semibold">{doctor.specialization}</p>
            {hospital && <p className="text-gray-400 text-xs truncate">{hospital}</p>}
            {!doctor.demoData && doctor.totalReviews > 0 && <div className="flex items-center gap-1.5 pt-1">
              <RatingStars rating={doctor.rating} size="xs" />
              <span className="text-xs text-gray-500">({doctor.totalReviews})</span>
            </div>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="w-3 h-3 text-green-600" /> {city}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3 text-green-600" /> {doctor.experience}y exp
          </div>
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(doctor.languages || []).slice(0, 3).map(lang => (
            <span key={lang} className="px-2.5 py-1 bg-green-50 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-100 dark:border-green-800/40 text-xs rounded-full">{lang}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-400">Fee</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{doctor.demoData ? 'Not a real fee' : formatCurrency(doctor.consultationFee)}</p>
          </div>
          <div className="flex gap-2.5">
            <Link href={`/doctors/${doctor.id}`} className="px-3.5 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-xl hover:bg-green-50 hover:border-green-300 hover:text-green-800 dark:hover:bg-gray-700 transition-colors">
              Profile
            </Link>
            {!doctor.demoData && <Link href={`/doctors/${doctor.id}?action=book`} className="px-3.5 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 shadow-xs transition-colors">Book</Link>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
