'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share2, Heart, MapPin, Clock, Star, CheckCircle, GraduationCap, Award, MessageSquare, ChevronRight, Stethoscope } from 'lucide-react';
import { RatingStars } from '@/components/ui/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { DoctorCard } from './DoctorCard';

export function DoctorDetailClient({ doctor, similarDoctors }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  const name = doctor.user?.name || 'Doctor';
  const image = doctor.profilePhoto || doctor.user?.image || null;
  const hospital = doctor.hospital?.name;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${name} - ${doctor.specialization}`,
        text: `Check out ${name}'s profile on our platform!`,
        url: window.location.href,
      });
    }
  };

  const handleFavorite = () => setIsFavorite(!isFavorite);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/doctors" className="hover:text-primary-600">Doctors</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 dark:text-gray-100">{name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Hero Profile */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 mb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-primary-100 dark:bg-primary-900 flex-shrink-0 flex items-center justify-center text-6xl shadow-sm border border-primary-200 dark:border-primary-800 overflow-hidden">
                  {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    doctor.gender === 'female' ? '👩⚕️' : '👨⚕️'
                  )}
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{name}</h1>
                        {doctor.isVerified && <CheckCircle className="w-6 h-6 text-blue-500" />}
                      </div>
                      <p className="text-lg text-primary-600 dark:text-primary-400 font-medium mb-1">{doctor.specialization}</p>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">{doctor.degree?.length ? doctor.degree.join(', ') : 'Qualifications not provided'}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={handleShare} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button onClick={handleFavorite} className={`p-2.5 rounded-xl border transition-colors ${isFavorite ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100 dark:border-gray-800 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Experience</p>
                      <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary-500" /> {doctor.experience}+ Years</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Location</p>
                      <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary-500" /> {doctor.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reviews</p>
                      {doctor.totalReviews > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span className="font-bold text-gray-900 dark:text-white">{doctor.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({doctor.totalReviews})</span>
                        </div>
                      ) : <p className="text-sm text-gray-500">No reviews yet</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Fee</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(doctor.consultationFee)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {(doctor.languages || []).map(lang => (
                      <Badge key={lang} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
              <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
                {['overview', 'education', 'reviews'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="p-6 md:p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About Doctor</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {doctor.biography || 'A professional biography has not been provided.'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Hospital / Clinic</h3>
                      {hospital ? (
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{hospital}</p>
                            <p className="text-sm text-gray-500">{doctor.hospital.city || doctor.city}</p>
                            {doctor.hospital.address && <p className="text-sm text-gray-500">{doctor.hospital.address}</p>}
                          </div>
                        </div>
                      ) : <p className="text-sm text-gray-500">No hospital or clinic affiliation has been listed.</p>}
                    </div>
                  </div>
                )}
                
                {activeTab === 'education' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary-500" /> Education</h3>
                      {doctor.education?.length || doctor.degree?.length ? (
                        <ul className="space-y-3">
                          {(doctor.education?.length ? doctor.education : doctor.degree).map((item, index) => {
                            const details = typeof item === 'string'
                              ? item
                              : [item?.degree, item?.title, item?.institution, item?.university, item?.year].filter(Boolean).join(' · ');
                            return details ? (
                              <li key={`${details}-${index}`} className="relative pl-6">
                                <span className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-primary-500" />
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{details}</p>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">Education details have not been provided.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary-500" /> Patient Reviews</h3>
                    {doctor.reviews?.length > 0 ? (
                      <div className="space-y-4">
                        {doctor.reviews.map(review => (
                          <div key={review.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                {review.patient?.user?.image ? (
                                  <img src={review.patient.user.image} alt={review.patient.user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{review.patient?.user?.name?.charAt(0) || 'U'}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{review.patient?.user?.name || 'Anonymous Patient'}</p>
                                <RatingStars rating={review.rating} size="xs" />
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No reviews yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Similar Doctors */}
            {similarDoctors?.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Similar Doctors</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {similarDoctors.map(sim => (
                    <DoctorCard key={sim.id} doctor={sim} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="w-full flex-shrink-0 lg:w-[340px]">
            <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Book a consultation</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">Choose a date and an appointment slot from the doctor&apos;s listed schedule. The booking flow checks availability before you submit.</p>
              <div className="mt-5 flex items-center justify-between border-y border-gray-100 py-4 dark:border-gray-800">
                <span className="text-sm text-gray-500">Consultation fee</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(doctor.consultationFee)}</span>
              </div>
              <Link href={`/dashboard/book-appointment?doctorId=${encodeURIComponent(doctor.id)}`} className="mt-5 flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700">
                Continue to booking
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
