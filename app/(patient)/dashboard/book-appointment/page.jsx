'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight, ChevronLeft, Calendar, Clock, User, Stethoscope, MapPin, Video, CreditCard, Check } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { RatingStars } from '@/components/ui/RatingStars';
import toast from 'react-hot-toast';
import { createAppointment, getAvailableSlots } from '@/actions/appointment.actions';
import { useRouter } from 'next/navigation';

const SPECIALTIES = [
  { name: 'Cardiologist', icon: '❤️', color: 'from-red-500 to-rose-600' },
  { name: 'Dermatologist', icon: '🩺', color: 'from-orange-500 to-amber-600' },
  { name: 'Neurologist', icon: '🧠', color: 'from-purple-500 to-violet-600' },
  { name: 'Orthopedic', icon: '🦴', color: 'from-blue-500 to-cyan-600' },
  { name: 'Pediatrician', icon: '👶', color: 'from-green-500 to-emerald-600' },
  { name: 'Gynecologist', icon: '🌸', color: 'from-pink-500 to-rose-600' },
  { name: 'ENT Specialist', icon: '👂', color: 'from-indigo-500 to-blue-600' },
  { name: 'Ophthalmologist', icon: '👁️', color: 'from-teal-500 to-cyan-600' },
  { name: 'Psychiatrist', icon: '🧘', color: 'from-violet-500 to-purple-600' },
  { name: 'General Physician', icon: '🩻', color: 'from-gray-500 to-slate-600' },
  { name: 'Urologist', icon: '💊', color: 'from-yellow-500 to-orange-600' },
  { name: 'Oncologist', icon: '🎗️', color: 'from-rose-500 to-pink-600' },
];

const STEPS = ['Specialty', 'Doctor', 'Date & Time', 'Details', 'Confirm'];

export default function BookAppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const fetchDoctors = async (specialty) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doctors?specialization=${encodeURIComponent(specialty)}&status=APPROVED&limit=10`);
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch { setDoctors([]); }
    finally { setLoading(false); }
  };

  const fetchSlots = async (doctorId, date) => {
    setLoading(true);
    try {
      const result = await getAvailableSlots(doctorId, date);
      setAvailableSlots(result.slots || []);
    } catch { setAvailableSlots([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) { toast.error('Please complete all steps'); return; }
    setSubmitting(true);
    try {
      const result = await createAppointment({
        doctorId: selectedDoctor.id,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        type: appointmentType,
        reason,
        symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
      });
      if (result.error) { toast.error(result.error); return; }
      setBooked(true);
    } catch { toast.error('Booking failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (booked) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-3xl font-black font-heading text-gray-900 dark:text-white mb-3">Appointment Booked!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">With <strong>{selectedDoctor?.user?.name}</strong> on <strong>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>{selectedSlot?.start}</strong>.</p>
          <p className="text-sm text-gray-400 mb-8">A confirmation email has been sent to you.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/dashboard/appointments')} className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">View Appointments</button>
            <button onClick={() => { setBooked(false); setStep(1); setSelectedSpecialty(''); setSelectedDoctor(null); setSelectedDate(''); setSelectedSlot(null); }} className="px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Book Another</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-black font-heading text-gray-900 dark:text-white mb-2">Book Appointment</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Follow the steps to book your appointment</p>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
              step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`hidden md:block ml-2 text-xs font-medium ${
              step === i + 1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
            }`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 mx-2 h-0.5 transition-colors ${ step > i + 1 ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-card p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Specialty */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select a Specialty</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {SPECIALTIES.map(({ name, icon, color }) => (
                  <button key={name} onClick={() => { setSelectedSpecialty(name); fetchDoctors(name); setStep(2); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                      selectedSpecialty === name ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                    }`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl`}>{icon}</div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Doctor */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Choose a {selectedSpecialty}</h2>
              <p className="text-xs text-gray-400 mb-4">{doctors.length} doctors available</p>
              {loading ? (
                <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-700 animate-pulse" />)}</div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No doctors found for this specialty. <button onClick={() => setStep(1)} className="text-primary-600 underline">Try another</button></div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {doctors.map(doctor => (
                    <button key={doctor.id} onClick={() => { setSelectedDoctor(doctor); setStep(3); }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:border-primary-300 ${
                        selectedDoctor?.id === doctor.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50' : 'border-gray-100 dark:border-gray-700'
                      }`}>
                      <Avatar src={doctor.user?.image} name={doctor.user?.name} size="lg" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{doctor.user?.name}</p>
                        <p className="text-xs text-primary-600 dark:text-primary-400">{doctor.specialization} • {doctor.experience} yrs exp</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-amber-500">⭐ {(doctor.rating || 0).toFixed(1)} ({doctor.totalReviews || 0})</div>
                          <div className="text-xs text-gray-400">{doctor.city}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">PKR {(doctor.consultationFee || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">per visit</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setStep(1)} className="mt-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ChevronLeft className="w-4 h-4" /> Back</button>
            </motion.div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Choose Date & Time</h2>
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Date</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map(date => (
                    <button key={date.toISOString()} onClick={() => { const d = date.toISOString().split('T')[0]; setSelectedDate(d); setSelectedSlot(null); fetchSlots(selectedDoctor.id, d); }}
                      className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl border-2 transition-all w-16 ${
                        selectedDate === date.toISOString().split('T')[0] ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
                      }`}>
                      <span className="text-xs text-gray-400">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{date.getDate()}</span>
                      <span className="text-xs text-gray-400">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                    </button>
                  ))}
                </div>
              </div>
              {selectedDate && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Available Times</p>
                  {loading ? (
                    <div className="grid grid-cols-4 gap-2">{Array(8).fill(0).map((_, i) => <div key={i} className="h-10 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />)}</div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No slots available for this date.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map(slot => (
                        <button key={slot.start} onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 text-xs font-semibold rounded-xl border-2 transition-all ${
                            selectedSlot?.start === slot.start ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300' : 'border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-200'
                          }`}>{slot.start}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex items-center gap-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 text-sm"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button onClick={() => { if (!selectedDate || !selectedSlot) { toast.error('Select date and time'); return; } setStep(4); }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Details */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Appointment Details</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Consultation Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ value: 'in-person', icon: MapPin, label: 'In-Person' }, { value: 'video', icon: Video, label: 'Video Call' }].map(({ value, icon: Icon, label }) => (
                      <button key={value} onClick={() => setAppointmentType(value)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          appointmentType === value ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                        <Icon className={`w-5 h-5 ${appointmentType === value ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${appointmentType === value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reason for Visit <span className="text-red-500">*</span></label>
                  <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Regular checkup, Follow-up, Fever..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Symptoms (comma separated)</label>
                  <textarea rows={2} value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. Fever, Headache, Cough" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="flex items-center gap-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 text-sm"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button onClick={() => { if (!reason.trim()) { toast.error('Reason is required'); return; } setStep(5); }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm">
                  Review <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Confirm */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Appointment</h2>
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 rounded-2xl border border-primary-100 dark:border-primary-900 p-5 space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Avatar src={selectedDoctor?.user?.image} name={selectedDoctor?.user?.name} size="lg" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedDoctor?.user?.name}</p>
                    <p className="text-sm text-primary-600 dark:text-primary-400">{selectedDoctor?.specialization}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Calendar className="w-4 h-4 text-primary-500" />{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Clock className="w-4 h-4 text-primary-500" />{selectedSlot?.start}</div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">{appointmentType === 'video' ? <Video className="w-4 h-4 text-primary-500" /> : <MapPin className="w-4 h-4 text-primary-500" />}{appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}</div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><CreditCard className="w-4 h-4 text-primary-500" />PKR {(selectedDoctor?.consultationFee || 0).toLocaleString()}</div>
                </div>
                <div className="pt-3 border-t border-primary-100 dark:border-primary-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400"><strong>Reason:</strong> {reason}</p>
                  {symptoms && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><strong>Symptoms:</strong> {symptoms}</p>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-primary-100 dark:border-primary-800">
                  <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-xl font-black text-primary-600 dark:text-primary-400">PKR {(selectedDoctor?.consultationFee || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(4)} className="flex items-center gap-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 text-sm"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                  {submitting ? 'Booking...' : '✓ Confirm & Book'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
