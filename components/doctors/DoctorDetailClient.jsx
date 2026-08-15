'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share2, Heart, MapPin, Clock, Star, CheckCircle, GraduationCap, Award, MessageSquare, Calendar, ChevronRight, Video } from 'lucide-react';
import { RatingStars } from '@/components/ui/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { DoctorCard } from './DoctorCard';

export function DoctorDetailClient({ doctor, similarDoctors }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const name = doctor.user?.name || 'Doctor';
  const image = doctor.user?.image || null;
  const hospital = doctor.hospital?.name || 'Private Clinic';

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

  // Fake slots for UI
  const availableSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '02:30 PM', '04:00 PM', '05:00 PM'
  ];

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
                      <p className="text-gray-500 dark:text-gray-400 mb-4">{doctor.degrees || 'MBBS, FCPS'}</p>
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
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span className="font-bold text-gray-900 dark:text-white">{doctor.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm text-gray-500">({doctor.totalReviews || 0})</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Fee</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(doctor.consultationFee)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {(doctor.languages || ['English', 'Urdu']).map(lang => (
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
                        {doctor.biography || `${name} is a highly qualified ${doctor.specialization} with over ${doctor.experience} years of experience in the field. Dedicated to providing the best patient care with a focus on comprehensive treatment.`}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Hospital / Clinic</h3>
                      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{hospital}</p>
                          <p className="text-sm text-gray-500">{doctor.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'education' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary-500" /> Education</h3>
                      <ul className="space-y-4">
                        <li className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 pb-2">
                          <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary-500" />
                          <p className="font-bold text-gray-900 dark:text-white">MBBS</p>
                          <p className="text-sm text-gray-500">Medical University • 2010</p>
                        </li>
                        <li className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                          <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary-500" />
                          <p className="font-bold text-gray-900 dark:text-white">{doctor.degrees || 'Specialization Degree'}</p>
                          <p className="text-sm text-gray-500">College of Physicians and Surgeons • 2015</p>
                        </li>
                      </ul>
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

          {/* Sidebar / Booking Widget */}
          <aside className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 sticky top-24 shadow-xl shadow-gray-200/50 dark:shadow-none">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Book Appointment</h3>
              <p className="text-sm text-gray-500 mb-6">Select a date and time to book</p>

              <div className="space-y-6">
                {/* Date Picker (Simplified) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-500" /> Select Date
                  </label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Slot Picker */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-500" /> Select Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)}
                        className={`py-2 text-xs font-semibold rounded-lg transition-colors border ${
                          selectedSlot === slot ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'
                        }`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary-500" /> Consultation Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3 cursor-pointer">
                      <Video className="w-5 h-5 text-primary-600 mb-1" />
                      <p className="font-bold text-sm text-gray-900 dark:text-white">Video</p>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                    <div className="border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-xl p-3 cursor-pointer hover:border-primary-300 transition-colors opacity-50">
                      <MapPin className="w-5 h-5 text-gray-400 mb-1" />
                      <p className="font-bold text-sm text-gray-900 dark:text-white">In-Person</p>
                      <p className="text-xs text-gray-500">At Clinic</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500">Consultation Fee</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(doctor.consultationFee)}</span>
                  </div>
                  <button disabled={!selectedSlot} className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-600/20">
                    Proceed to Book
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
