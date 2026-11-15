'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Share2, Heart, MapPin, Clock, Star, CheckCircle, GraduationCap, 
  Award, MessageSquare, ChevronRight, Stethoscope, Video, Calendar, 
  ShieldCheck, AlertCircle, Building2, User, Phone, Check, Sparkles, ArrowRight
} from 'lucide-react';
import { RatingStars } from '@/components/ui/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DoctorCard } from './DoctorCard';
import { createAppointment, getAvailableSlots } from '@/actions/appointment.actions';
import toast from 'react-hot-toast';

const DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function dateToYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DoctorDetailClient({ doctor, similarDoctors }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking widget state
  const [consultationType, setConsultationType] = useState('in-person');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const name = doctor.user?.name || 'Doctor';
  const image = doctor.profilePhoto || doctor.user?.image || null;
  const hospital = doctor.location || doctor.hospital?.name || 'Affiliated Medical Center';

  // Available days from doctor.availability
  const activeAvailability = (doctor.availability || []).filter(a => a.isAvailable);
  const availableDaysFormatted = activeAvailability.length > 0
    ? activeAvailability.map(a => DAYS_NAMES[a.dayOfWeek]).join(', ')
    : 'Monday to Saturday';

  // Generate next 14 dates for appointment booking
  const nextDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  // Pre-select first date
  useEffect(() => {
    if (nextDates.length > 0 && !selectedDate) {
      setSelectedDate(dateToYMD(nextDates[0]));
    }
  }, [nextDates, selectedDate]);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate || !doctor.id) return;
    let isMounted = true;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await getAvailableSlots(doctor.id, selectedDate);
        if (isMounted) {
          setAvailableSlots(res.slots || []);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
        if (isMounted) setAvailableSlots([]);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    };
    fetchSlots();
    return () => { isMounted = false; };
  }, [doctor.id, selectedDate]);

  // Handle appointment booking submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error('Please choose an appointment date');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please select an available appointment time slot');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a brief reason for your consultation');
      return;
    }

    setSubmittingBooking(true);
    try {
      const payload = {
        doctorId: doctor.id,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        type: consultationType,
        reason: reason.trim(),
        symptoms: symptoms ? symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      const res = await createAppointment(payload);
      if (res?.error) {
        toast.error(res.error);
        if (res.error.includes('sign in') || res.error.includes('patient account')) {
          router.push(`/login?callbackUrl=/doctors/${doctor.id}?action=book`);
        }
      } else if (res?.success) {
        toast.success('Appointment request submitted successfully!');
        setBookingSuccess({
          appointmentId: res.appointmentId,
          date: selectedDate,
          time: selectedSlot.start,
          type: consultationType,
          doctorName: name,
          specialty: doctor.specialization,
          fee: doctor.consultationFee,
        });
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${name} — ${doctor.specialization}`,
        text: `Consult with ${name}, ${doctor.specialization} on MediConnect.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('Doctor profile link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs sm:text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-green-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-400" />
          <Link href="/doctors" className="hover:text-green-700 transition-colors">Specialized Doctors</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-400" />
          <span className="text-gray-900 dark:text-gray-100 font-semibold">{name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Doctor Profile Body */}
          <div className="flex-1 min-w-0 w-full space-y-8">
            {/* Hero Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-[#D1FAE5] dark:border-emerald-950/60 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Doctor Portrait */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-emerald-50 dark:bg-emerald-950 flex-shrink-0 border-2 border-emerald-100 dark:border-emerald-800 shadow-md">
                  {image ? (
                    <Image
                      src={image}
                      alt={name}
                      fill
                      sizes="160px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-emerald-800 text-white text-5xl font-bold">
                      {name.replace(/^(dr\.|prof\.|assoc\.|dr)\s+/i, '').charAt(0) || 'D'}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
                          {name}
                        </h1>
                        {doctor.isVerified && (
                          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" title="PMDC Verified Medical Practitioner" />
                        )}
                      </div>
                      <p className="text-base sm:text-lg text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                        {doctor.specialization}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {Array.isArray(doctor.degree) && doctor.degree.length > 0
                          ? doctor.degree.join(' · ')
                          : 'MBBS, FCPS'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleShare}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors"
                        title="Share Profile"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`p-2.5 rounded-xl border transition-colors ${
                          isFavorite
                            ? 'border-rose-200 bg-rose-50 text-rose-500'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800'
                        }`}
                        title="Favorite Doctor"
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* License & Verification Badge */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {doctor.licenseNumber || 'Verified PMDC Registration'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
                      <Video className="w-3 h-3 text-blue-600" /> Online Video
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-300 text-xs font-medium border border-slate-200 dark:border-gray-700">
                      <Building2 className="w-3 h-3 text-slate-600" /> In-Person Clinic
                    </span>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5 border-y border-gray-100 dark:border-gray-800 mb-4">
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold uppercase">Experience</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" /> {doctor.experience}+ Years
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold uppercase">Location</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {doctor.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold uppercase">Patient Rating</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                        <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                          {(doctor.rating || 5).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">({doctor.totalReviews || 24})</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold uppercase">Consultation Fee</p>
                      <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm sm:text-base mt-0.5">
                        {formatCurrency(doctor.consultationFee || 2000)}
                      </p>
                    </div>
                  </div>

                  {/* Spoken Languages */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500">Languages:</span>
                    {(doctor.languages || ['English', 'Urdu']).map(lang => (
                      <span key={lang} className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-[#D1FAE5] dark:border-emerald-950/60 overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
                {['overview', 'availability', 'education', 'reviews'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 capitalize ${
                      activeTab === tab
                        ? 'border-green-600 text-green-700 dark:text-green-400'
                        : 'border-transparent text-gray-500 hover:text-green-700 dark:hover:text-white'
                    }`}
                  >
                    {tab === 'overview' ? 'Overview & Bio' :
                     tab === 'availability' ? 'Clinical Schedule' :
                     tab === 'education' ? 'Qualifications' : 'Patient Reviews'}
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-8">
                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Professional Biography</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                        {doctor.biography || `${name} is an experienced medical specialist in ${doctor.specialization} with over ${doctor.experience} years of clinical practice.`}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Hospital & Clinic Affiliation</h3>
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{hospital}</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{doctor.city}, Pakistan</p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                            Equipped with diagnostic facilities & dedicated patient suites
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Availability Section */}
                {activeTab === 'availability' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Available Consultation Schedule</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-4">
                        Consultation slots are open for pre-booking across the listed clinical days.
                      </p>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {activeAvailability.map(slot => (
                          <div
                            key={slot.dayOfWeek}
                            className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-emerald-600" />
                              <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">
                                  {DAYS_NAMES[slot.dayOfWeek]}
                                </p>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                  Slot duration: {slot.slotDuration || 30} mins
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                              {slot.startTime} – {slot.endTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Consultation Options:
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• <strong>In-Person:</strong> Attend at {hospital}, {doctor.city}. Please arrive 10 minutes prior.</li>
                        <li>• <strong>Online Video:</strong> Join high-definition telehealth room via MediConnect portal.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Education */}
                {activeTab === 'education' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <GraduationCap className="w-5 h-5 text-emerald-600" /> Medical Degrees & Training
                    </h3>
                    <ul className="space-y-3">
                      {(doctor.degree || ['MBBS', 'FCPS']).map((deg, i) => (
                        <li key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{deg}</p>
                            <p className="text-xs text-gray-500">Accredited by Pakistan Medical and Dental Council</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reviews */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-600" /> Patient Feedback
                    </h3>
                    {doctor.reviews?.length > 0 ? (
                      <div className="space-y-3">
                        {doctor.reviews.map(r => (
                          <div key={r.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">{r.patient?.user?.name || 'Verified Patient'}</p>
                              <RatingStars rating={r.rating} size="xs" />
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-xs sm:text-sm text-gray-500">
                          No written reviews submitted yet. The doctor holds an aggregate clinical rating of <strong>{(doctor.rating || 5).toFixed(1)} / 5.0</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Similar Doctors */}
            {similarDoctors?.length > 0 && (
              <div>
                <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-4">
                  More Specialists in {doctor.specialization}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {similarDoctors.map(sim => (
                    <DoctorCard key={sim.id} doctor={sim} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Booking Sidebar */}
          <aside className="w-full lg:w-[380px] flex-shrink-0 sticky top-24">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-[#D1FAE5] dark:border-emerald-950/60 p-6 shadow-xl shadow-green-950/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">Book Appointment</h3>
                    <p className="text-xs text-gray-400">Direct booking with instant confirmation</p>
                  </div>
                </div>
              </div>

              {/* Success confirmation view */}
              {bookingSuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                    Booking Request Sent!
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Your appointment with <strong>{bookingSuccess.doctorName}</strong> on <strong>{bookingSuccess.date}</strong> at <strong>{bookingSuccess.time}</strong> is confirmed.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href="/dashboard/appointments"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                    >
                      View in My Appointments
                    </Link>
                    <button
                      onClick={() => setBookingSuccess(null)}
                      className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold underline"
                    >
                      Book Another Slot
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Step 1: Consultation Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      1. Consultation Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setConsultationType('in-person')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                          consultationType === 'in-person'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" /> In-Person Clinic
                      </button>
                      <button
                        type="button"
                        onClick={() => setConsultationType('video')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                          consultationType === 'video'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" /> Video Consult
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Choose Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      2. Select Date
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {nextDates.map(dateObj => {
                        const ymd = dateToYMD(dateObj);
                        const isSelected = selectedDate === ymd;
                        const dayName = DAYS_NAMES[dateObj.getDay()].slice(0, 3);
                        const dayNum = dateObj.getDate();
                        const monthName = dateObj.toLocaleString('default', { month: 'short' });

                        return (
                          <button
                            key={ymd}
                            type="button"
                            onClick={() => setSelectedDate(ymd)}
                            className={`flex-shrink-0 w-16 py-2 rounded-xl text-center border transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                            }`}
                          >
                            <span className="block text-[10px] uppercase font-bold opacity-80">{dayName}</span>
                            <span className="block text-base font-extrabold">{dayNum}</span>
                            <span className="block text-[10px] font-medium opacity-80">{monthName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Select Time Slot */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      3. Available Time Slots
                    </label>

                    {loadingSlots ? (
                      <div className="py-6 text-center text-xs text-gray-400">
                        <span className="inline-block animate-spin mr-1">⌛</span> Checking schedule...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="py-4 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                          No open slots on this date. Please pick another date.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                        {availableSlots.map(slot => {
                          const isSelected = selectedSlot?.start === slot.start;
                          return (
                            <button
                              key={slot.start}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                              }`}
                            >
                              {slot.start}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step 4: Reason & Symptoms */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      4. Reason for Visit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="e.g. Routine checkup, chest discomfort"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Fee Summary */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Consultation Fee</p>
                      <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(doctor.consultationFee || 2000)}
                      </p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                      Pay at Clinic or Online
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submittingBooking || !selectedSlot}
                    className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingBooking ? (
                      <>
                        <span className="inline-block animate-spin">⏳</span> Processing Booking...
                      </>
                    ) : (
                      <>
                        Confirm & Book Appointment <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-gray-400 leading-tight">
                    Instant confirmation. Free cancellation up to 2 hours before the appointment.
                  </p>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default DoctorDetailClient;
