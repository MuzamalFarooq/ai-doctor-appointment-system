'use client';
import Link from 'next/link';
import { MapPin, Clock, Star, Users, ChevronRight, Heart, Video, CheckCircle } from 'lucide-react';
import { RatingStars } from '@/components/ui/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

export function DoctorCard({ doctor, viewMode = 'grid' }) {
  const name = doctor.user?.name || 'Doctor';
  const hospital = doctor.hospital?.name || 'Private Clinic';
  const gradients = [
    'from-blue-500 to-primary-600',
    'from-pink-500 to-rose-600',
    'from-purple-500 to-violet-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
  ];
  const gradient = gradients[doctor.id.charCodeAt(0) % gradients.length];

  if (viewMode === 'list') {
    return (
      <motion.div whileHover={{ x: 4 }} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 flex items-center gap-5">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex-shrink-0 flex items-center justify-center text-3xl`}>
          {doctor.gender === 'female' ? '👩⚕️' : '👨⚕️'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{name}</h3>
              <p className="text-primary-600 dark:text-primary-400 text-sm">{doctor.specialization}</p>
            </div>
            <Badge variant={doctor.isVerified ? 'success' : 'default'} dot>{doctor.isVerified ? 'Verified' : 'Unverified'}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doctor.city}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{doctor.experience}y exp</span>
            <RatingStars rating={doctor.rating} size="xs" />
            <span>({doctor.totalReviews} reviews)</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">Consultation</p>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(doctor.consultationFee)}</p>
          <Link href={`/doctors/${doctor.id}`} className="mt-2 inline-block px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-xl hover:bg-primary-700 transition-colors">
            Book Now
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Top Gradient Bar */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex-shrink-0 flex items-center justify-center text-2xl`}>
            {doctor.gender === 'female' ? '👩⚕️' : '👨⚕️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{name}</h3>
              {doctor.isVerified && (
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-primary-600 dark:text-primary-400 text-xs font-medium">{doctor.specialization}</p>
            <p className="text-gray-400 text-xs truncate">{hospital}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <RatingStars rating={doctor.rating} size="xs" />
              <span className="text-xs text-gray-500">({doctor.totalReviews})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="w-3 h-3" /> {doctor.city}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" /> {doctor.experience}y exp
          </div>
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-1 mb-4">
          {(doctor.languages || []).slice(0, 3).map(lang => (
            <span key={lang} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">{lang}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-400">Fee</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(doctor.consultationFee)}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/doctors/${doctor.id}`} className="px-3 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Profile
            </Link>
            <Link href={`/doctors/${doctor.id}?action=book`} className="px-3 py-2 bg-primary-600 text-white text-xs font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              Book
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
