'use client';
import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';


const FAQS = [
  { cat: 'Getting Started', q: 'How do I create an account?', a: 'Click "Register" at the top right. You can sign up with your email or Google account. Registration takes less than 2 minutes.' },
  { cat: 'Getting Started', q: 'Is MediConnect AI free to use?', a: 'Yes! Our Basic plan is completely free and includes browsing doctors, AI symptom checker (3/day), and up to 2 appointments per month.' },
  { cat: 'Appointments', q: 'How do I book an appointment?', a: 'Go to "Find Doctors", choose your specialty, select a doctor, pick a date and time, and confirm. You\'ll receive a confirmation email instantly.' },
  { cat: 'Appointments', q: 'Can I cancel or reschedule an appointment?', a: 'Yes, you can cancel from your dashboard up to 2 hours before the appointment. Rescheduling is available for upcoming appointments.' },
  { cat: 'Appointments', q: 'What is a video consultation?', a: 'Video consultations allow you to see a doctor from the comfort of your home via high-quality video call using our built-in platform powered by Daily.co.' },
  { cat: 'Payments', q: 'What payment methods are accepted?', a: 'We accept Stripe (Visa/MasterCard), JazzCash, EasyPaisa, and bank transfer. All transactions are secured with 256-bit SSL encryption.' },
  { cat: 'Payments', q: 'Are there any hidden fees?', a: 'No hidden fees. The consultation fee displayed on the doctor\'s profile is exactly what you pay. No booking surcharge.' },
  { cat: 'AI Features', q: 'How does the AI Symptom Checker work?', a: 'Our AI analyzes your symptoms, age, gender, and medical history to recommend the most appropriate specialist and assess urgency. It uses GPT-4o for medical reasoning.' },
  { cat: 'AI Features', q: 'Is the AI diagnosis accurate?', a: 'The AI provides informational guidance only — it does not replace a doctor\'s diagnosis. Always consult a qualified healthcare professional for medical decisions.' },
  { cat: 'Doctors', q: 'How are doctors verified?', a: 'All doctors go through a rigorous verification process including PMC/PMDC license verification, degree verification, and background checks before being approved.' },
  { cat: 'Privacy', q: 'Is my health data secure?', a: 'Yes. All data is encrypted in transit and at rest. We follow strict HIPAA-equivalent data protection standards and never sell your data.' },
];

const CATEGORIES = ['All', ...new Set(FAQS.map(f => f.cat))];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter(f =>
    (activeCategory === 'All' || f.cat === activeCategory) &&
    (f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 md:pt-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black font-heading text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-500 dark:text-gray-400">Can't find what you're looking for? <a href="/contact" className="text-primary-600 hover:underline">Contact us</a>.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..." className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
              }`}>{cat}</button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {filtered.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-4 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">No questions match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
