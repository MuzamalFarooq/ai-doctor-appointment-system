'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import {
  Search, Calendar, Brain, Stethoscope, Star, ArrowRight, Play,
  CheckCircle, Users, Clock, Shield, Heart, Zap, Activity,
  ChevronRight, Sparkles, Video, FileText, Phone,
  TrendingUp, Award, Globe, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';

// --- Data ---
const SPECIALIZATIONS = [
  { name: 'General Physician', icon: '🩺', color: 'blue', count: 120 },
  { name: 'Cardiologist', icon: '❤️', color: 'red', count: 45 },
  { name: 'Dermatologist', icon: '🧴', color: 'pink', count: 38 },
  { name: 'Neurologist', icon: '🧠', color: 'purple', count: 32 },
  { name: 'Orthopedic', icon: '🦴', color: 'orange', count: 41 },
  { name: 'Pediatrician', icon: '👶', color: 'yellow', count: 55 },
  { name: 'Gynecologist', icon: '👩⚕️', color: 'rose', count: 48 },
  { name: 'Psychiatrist', icon: '🧘', color: 'indigo', count: 29 },
  { name: 'Ophthalmologist', icon: '👁️', color: 'cyan', count: 33 },
  { name: 'ENT Specialist', icon: '👂', color: 'teal', count: 27 },
  { name: 'Urologist', icon: '🫁', color: 'violet', count: 24 },
  { name: 'Oncologist', icon: '🔬', color: 'emerald', count: 18 },
];

const FEATURED_DOCTORS = [
  { id: '1', name: 'Dr. Ahmed Khan', spec: 'Cardiologist', exp: 15, rating: 4.9, reviews: 324, fee: 2500, hospital: 'PIMS Hospital', city: 'Islamabad', available: true, gender: 'male' },
  { id: '2', name: 'Dr. Sarah Malik', spec: 'Dermatologist', exp: 10, rating: 4.8, reviews: 289, fee: 2000, hospital: 'Shifa International', city: 'Islamabad', available: true, gender: 'female' },
  { id: '3', name: 'Dr. Bilal Hussain', spec: 'Neurologist', exp: 12, rating: 4.9, reviews: 198, fee: 3000, hospital: 'Agha Khan Hospital', city: 'Karachi', available: false, gender: 'male' },
  { id: '4', name: 'Dr. Fatima Rizvi', spec: 'Pediatrician', exp: 8, rating: 4.7, reviews: 412, fee: 1500, hospital: 'Children Hospital', city: 'Lahore', available: true, gender: 'female' },
  { id: '5', name: 'Dr. Omar Sheikh', spec: 'Orthopedic', exp: 18, rating: 4.8, reviews: 156, fee: 3500, hospital: 'CMH Rawalpindi', city: 'Rawalpindi', available: true, gender: 'male' },
  { id: '6', name: 'Dr. Ayesha Siddiqui', spec: 'Gynecologist', exp: 14, rating: 4.9, reviews: 534, fee: 2200, hospital: 'Ziauddin Hospital', city: 'Karachi', available: true, gender: 'female' },
];

const TESTIMONIALS = [
  { name: 'Zara Ahmed', location: 'Islamabad', rating: 5, text: 'The AI symptom checker was incredibly accurate. It suggested I see a cardiologist, and it turned out I had a minor heart condition that was caught early. MediConnect AI literally saved my life!', avatar: 'ZA', doctor: 'Dr. Ahmed Khan' },
  { name: 'Hassan Ali', location: 'Lahore', rating: 5, text: 'Booking an appointment used to take days. With MediConnect AI, I found a specialist, checked their availability, and booked a slot — all in under 5 minutes. Revolutionary!', avatar: 'HA', doctor: 'Dr. Fatima Rizvi' },
  { name: 'Sana Mehmood', location: 'Karachi', rating: 5, text: 'The video consultation feature is a game changer. I got a prescription from a top dermatologist without leaving my home. The AI health chatbot also helped me understand my medication.', avatar: 'SM', doctor: 'Dr. Sarah Malik' },
];

const BLOG_POSTS = [
  { slug: 'ai-in-healthcare', title: 'How AI is Revolutionizing Healthcare in Pakistan', excerpt: 'Artificial intelligence is transforming how patients access care and how doctors make diagnoses...', category: 'AI Health', readTime: 5, date: 'Dec 15, 2025', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop' },
  { slug: 'heart-health-tips', title: '10 Evidence-Based Tips for a Healthy Heart', excerpt: 'Cardiologists share their top recommendations for maintaining cardiovascular health at any age...', category: 'Cardiology', readTime: 4, date: 'Dec 10, 2025', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=250&fit=crop' },
  { slug: 'telemedicine-future', title: 'The Future of Telemedicine in South Asia', excerpt: 'Video consultations are making quality healthcare accessible to millions in remote areas...', category: 'Telemedicine', readTime: 6, date: 'Dec 5, 2025', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop' },
];

// --- Animated Counter ---
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// --- Doctor Card ---
function DoctorCard({ doctor }) {
  const avatarColors = ['from-blue-500 to-blue-600', 'from-pink-500 to-rose-600', 'from-purple-500 to-violet-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600', 'from-cyan-500 to-blue-500'];
  const idx = parseInt(doctor.id) - 1;
  const gradient = avatarColors[idx % avatarColors.length];
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-7 border border-gray-100 dark:border-gray-700 shadow-card hover:shadow-lg-custom transition-shadow duration-300 space-y-4"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
          {doctor.gender === 'female' ? '👩⚕️' : '👨⚕️'}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{doctor.name}</h3>
          <p className="text-primary-600 dark:text-primary-400 text-xs font-medium">{doctor.spec}</p>
          <p className="text-gray-400 text-xs">{doctor.hospital}</p>
          <div className="flex items-center gap-1.5 pt-1">
            <RatingStars rating={doctor.rating} size="xs" />
            <span className="text-xs text-gray-500">({doctor.reviews})</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-y border-gray-100 dark:border-gray-700/60">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{doctor.exp}y exp</span>
        <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{doctor.city}</span>
        <span className={`flex items-center gap-1 ${doctor.available ? 'text-green-500' : 'text-gray-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${doctor.available ? 'bg-green-400' : 'bg-gray-300'}`} />
          {doctor.available ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs text-gray-400">Consultation Fee</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">PKR {doctor.fee.toLocaleString()}</p>
        </div>
        <Link href={`/doctors/${doctor.id}`} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl transition-colors">
          Book Now
        </Link>
      </div>
    </motion.div>
  );
}

// --- Main Page ---
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/doctors?q=${encodeURIComponent(searchQuery)}`;
  };

  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
  const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-gray-900 to-accent-950">
          <div className="blob w-96 h-96 bg-primary-500 top-20 -left-20" />
          <div className="blob w-80 h-80 bg-accent-500 top-1/2 right-0" style={{ animationDelay: '3s' }} />
          <div className="blob w-72 h-72 bg-teal-500 bottom-0 left-1/3" style={{ animationDelay: '6s' }} />
          {/* Grid Pattern */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-20 lg:pt-40 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 sm:space-y-7">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-sm mb-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Pakistan&apos;s #1 AI Health Platform
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-white leading-snug sm:leading-tight mb-8">
                AI-Powered
                <br />
                <span className="gradient-text">Healthcare</span>
                <br />
                at Your Fingertips
              </motion.h1>
              <motion.p variants={fadeUp} className="text-gray-300 text-lg mb-10 max-w-xl leading-relaxed">
                Find top doctors, get AI health recommendations, book appointments instantly, and consult from anywhere. Smart healthcare, redefined.
              </motion.p>

              {/* Search Bar */}
              <motion.form variants={fadeUp} onSubmit={handleSearch} className="flex gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2.5 sm:p-3 mb-10 max-w-xl">
                <div className="flex items-center gap-3 flex-1 px-3">
                  <Search className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search doctors, specializations, hospitals..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
                  />
                </div>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm">
                  Search
                </button>
              </motion.form>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-12">
                <Link href="/doctors" className="flex items-center gap-2.5 px-7 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg text-sm">
                  <Calendar className="w-4 h-4" /> Book Appointment
                </Link>
                <Link href="/ai-symptom-checker" className="flex items-center gap-2.5 px-7 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm">
                  <Brain className="w-4 h-4" /> Try AI Diagnosis
                </Link>
              </motion.div>

              {/* Hero Stats */}
              <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 pt-4 border-t border-white/10">
                {[
                  { value: 10000, label: 'Patients', suffix: '+' },
                  { value: 500, label: 'Doctors', suffix: '+' },
                  { value: 50, label: 'Specializations', suffix: '+' },
                  { value: 4.9, label: 'Rating', suffix: '★', noCount: true },
                ].map(stat => (
                  <div key={stat.label} className="text-center space-y-1">
                    <div className="text-2xl font-black text-white">
                      {stat.noCount ? stat.value : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                      {stat.noCount && stat.suffix}
                    </div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative h-[600px]"
            >
              {/* Main Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-12 right-0 w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-primary-600 flex items-center justify-center text-xl">👨⚕️</div>
                  <div>
                    <p className="text-white font-semibold text-sm">Dr. Ahmed Khan</p>
                    <p className="text-primary-300 text-xs">Cardiologist</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Available today — 2:00 PM
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> 4.9 rating • 324 reviews
                  </div>
                </div>
                <button className="w-full mt-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-xl transition-colors">
                  Book Appointment
                </button>
              </motion.div>

              {/* AI Card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-60 left-0 w-64 bg-gradient-to-br from-accent-600/80 to-primary-600/80 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-white" />
                  <p className="text-white font-semibold text-sm">AI Diagnosis</p>
                </div>
                <p className="text-white/80 text-xs mb-3">Based on your symptoms: fever, headache, body pain...</p>
                <div className="bg-white/20 rounded-xl p-3">
                  <p className="text-white text-xs font-medium">Recommended: General Physician</p>
                  <p className="text-green-300 text-xs mt-1">Urgency: Book this week</p>
                </div>
              </motion.div>

              {/* Notification Card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-20 right-8 w-60 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/30 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">Appointment Confirmed!</p>
                    <p className="text-gray-400 text-xs">Tomorrow, 10:30 AM</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full" fill="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" className="fill-white dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* ===== SPECIALIZATIONS ===== */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center space-y-4">
            <Badge variant="primary" className="mb-2">Browse by Specialty</Badge>
            <h2 className="text-3xl lg:text-4xl font-black font-heading text-gray-900 dark:text-white leading-snug">
              Find the Right <span className="gradient-text">Specialist</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">From general physicians to specialized surgeons — find expert care for every health need.</p>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6"
          >
            {SPECIALIZATIONS.map((spec) => (
              <motion.div key={spec.name} variants={fadeUp}>
                <Link
                  href={`/doctors?spec=${encodeURIComponent(spec.name)}`}
                  className="group flex flex-col items-center p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-all duration-300 hover:-translate-y-1 space-y-2"
                >
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{spec.icon}</div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors leading-tight">{spec.name}</p>
                  <p className="text-xs text-gray-400">{spec.count} doctors</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center pt-4">
            <Link href="/doctors" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all text-sm">
              View all specializations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center space-y-4">
            <Badge variant="primary" className="mb-2">Simple & Fast</Badge>
            <h2 className="text-3xl lg:text-4xl font-black font-heading text-gray-900 dark:text-white leading-snug">
              Get Care in <span className="gradient-text">4 Easy Steps</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary-200 via-accent-200 to-teal-200 dark:from-primary-800 dark:via-accent-800 dark:to-teal-800" />
            {[
              { step: '01', icon: Search, title: 'Search & Compare', desc: 'Search doctors by specialty, city, fee, and rating. Compare profiles to find your best match.', color: 'blue' },
              { step: '02', icon: Brain, title: 'AI Recommendation', desc: 'Enter your symptoms and let our AI analyze your condition and suggest the ideal specialist.', color: 'purple' },
              { step: '03', icon: Calendar, title: 'Book Appointment', desc: 'Select an available time slot, provide your details, and confirm your booking instantly.', color: 'teal' },
              { step: '04', icon: Video, title: 'Consult & Heal', desc: 'Meet your doctor in-person or via secure video call. Get prescriptions and follow-up care.', color: 'green' },
            ].map(({ step, icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center space-y-3 p-4"
              >
                <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/30 relative z-10`}>
                  <Icon className={`w-9 h-9 text-${color}-600 dark:text-${color}-400`} />
                  <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-${color}-600 text-white text-xs font-bold flex items-center justify-center`}>{step}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED DOCTORS ===== */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-end justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
            <div className="space-y-2">
              <Badge variant="primary" className="mb-2">Top Rated</Badge>
              <h2 className="text-3xl lg:text-4xl font-black font-heading text-gray-900 dark:text-white leading-snug">
                Featured <span className="gradient-text">Doctors</span>
              </h2>
            </div>
            <Link href="/doctors" className="hidden md:flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
          >
            {FEATURED_DOCTORS.map((doctor) => (
              <motion.div key={doctor.id} variants={fadeUp}>
                <DoctorCard doctor={doctor} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== AI FEATURES ===== */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary-950 via-gray-900 to-accent-950 relative overflow-hidden">
        <div className="blob w-72 h-72 bg-primary-500 top-0 right-0 opacity-20" />
        <div className="blob w-60 h-60 bg-accent-500 bottom-0 left-0 opacity-20" style={{ animationDelay: '4s' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center space-y-4">
            <Badge variant="gradient" className="mb-2">Powered by GPT-4o</Badge>
            <h2 className="text-3xl lg:text-4xl font-black font-heading text-white leading-snug">
              AI That Understands <span className="gradient-text">Your Health</span>
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto leading-relaxed">Two powerful AI tools to guide your healthcare journey</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                href: '/ai-symptom-checker',
                icon: Brain,
                gradient: 'from-primary-600 to-primary-700',
                title: 'AI Symptom Analyzer',
                desc: 'Describe your symptoms and get intelligent specialist recommendations powered by GPT-4o. Our AI analyzes your age, medical history, and symptoms to suggest the right doctor.',
                features: ['Specialist recommendation', 'Urgency assessment', 'Top doctor matching', 'Explains reasoning'],
                badge: 'Most Popular',
              },
              {
                href: '/ai-health-assistant',
                icon: Sparkles,
                gradient: 'from-accent-600 to-accent-700',
                title: 'AI Health Assistant',
                desc: 'Chat with your personal AI health assistant 24/7. Get answers to medical questions, medication information, lifestyle advice, diet tips, and help booking appointments.',
                features: ['Medical Q&A', 'Medicine information', 'Diet & lifestyle advice', 'Appointment help'],
                badge: '24/7 Available',
              },
            ].map(({ href, icon: Icon, gradient, title, desc, features, badge }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-10 lg:p-12 hover:bg-white/10 transition-all duration-300 group space-y-6"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <Badge variant="gradient">{badge}</Badge>
                </div>
                <h3 className="text-xl font-bold text-white leading-snug">{title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
                <ul className="space-y-3 pt-2">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <Link href={href} className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all group-hover:border-white/40 text-sm">
                    Try Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {[
              { icon: Users, value: 10000, suffix: '+', label: 'Happy Patients', color: 'blue', desc: 'Trusted by thousands' },
              { icon: Stethoscope, value: 500, suffix: '+', label: 'Expert Doctors', color: 'purple', desc: 'Verified specialists' },
              { icon: Calendar, value: 50000, suffix: '+', label: 'Appointments', color: 'teal', desc: 'Successfully booked' },
              { icon: Award, value: 4.9, suffix: '★', label: 'Avg. Rating', color: 'orange', noCount: true, desc: 'Patient satisfaction' },
            ].map(({ icon: Icon, value, suffix, label, color, noCount, desc }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-8 sm:p-10 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 space-y-2"
              >
                <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                  {noCount ? `${value}${suffix}` : <AnimatedCounter target={value} suffix={suffix} />}
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</div>
                <div className="text-xs text-gray-400 mt-1">{desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center space-y-4">
            <Badge variant="success" className="mb-2">Patient Stories</Badge>
            <h2 className="text-3xl lg:text-4xl font-black font-heading text-gray-900 dark:text-white leading-snug">
              What Our Patients <span className="gradient-text">Say</span>
            </h2>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-3 gap-8 sm:gap-10"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 border border-gray-100 dark:border-gray-700 shadow-card space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    {Array(5).fill(0).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed italic">&quot;{t.text}&quot;</p>
                </div>
                <div className="flex items-center gap-3.5 pt-4 border-t border-gray-100 dark:border-gray-700/60">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{t.location} • Patient of {t.doctor}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-end justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
            <div className="space-y-2">
              <Badge variant="info" className="mb-2">Health Articles</Badge>
              <h2 className="text-3xl lg:text-4xl font-black font-heading text-gray-900 dark:text-white leading-snug">
                Stay <span className="gradient-text">Informed</span>
              </h2>
            </div>
            <Link href="/blog" className="hidden md:flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-sm">
              All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-3 gap-8 sm:gap-10"
          >
            {BLOG_POSTS.map((post) => (
              <motion.div key={post.slug} variants={fadeUp}>
                <Link href={`/blog/${post.slug}`} className="group block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-52 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <Badge variant="primary" className="absolute top-4 left-4">{post.category}</Badge>
                  </div>
                  <div className="p-6 sm:p-7 space-y-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA / DOWNLOAD APP ===== */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary-950 via-gray-900 to-accent-950 relative overflow-hidden">
        <div className="blob w-80 h-80 bg-primary-500 top-0 left-1/4 opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Badge variant="gradient" className="mb-6">Download App</Badge>
              <h2 className="text-3xl lg:text-5xl font-black font-heading text-white mb-4">
                Healthcare in Your Pocket
              </h2>
              <p className="text-gray-300 text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
                Book appointments, chat with doctors, and manage your health — all from your smartphone.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <a href="#" className="flex items-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-colors shadow-lg">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Download on the</div>
                    <div className="font-bold">App Store</div>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-colors">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.76c.37.2.8.24 1.2.1L14.9 12 4.38.14c-.4-.14-.83-.1-1.2.1C2.44.66 2 1.56 2 2.56v18.88c0 1 .44 1.9 1.18 2.32M16 13.06L5.88 23.18l9.98-5.75zM20.82 9.1L17.7 7.3 14.1 11l3.6 3.7 3.12-1.8c.9-.52.9-1.88.9-2.4s0-1.88-.9-2.4M5.88.82L16 10.94l3.7-3.7z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Get it on</div>
                    <div className="font-bold">Google Play</div>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TRUST SECTION ===== */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-12">
            <p className="text-gray-500 text-sm font-medium">Trusted & Verified:</p>
            {[
              { label: 'HIPAA Compliant', icon: Shield },
              { label: 'SSL Encrypted', icon: Lock },
              { label: '99.9% Uptime', icon: Activity },
              { label: 'PMC Verified', icon: CheckCircle },
              { label: 'ISO 27001', icon: Award },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Icon className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
