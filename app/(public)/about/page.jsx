import Link from 'next/link';
import { Heart, Shield, Zap, Users, Award, Globe } from 'lucide-react';

export const metadata = {
  title: 'About Us - MediConnect AI',
  description: 'Learn about MediConnect AI and our mission to make healthcare accessible to everyone in Pakistan.',
};

const STATS = [
  { value: '500+', label: 'Verified Doctors', icon: '🩺' },
  { value: '50,000+', label: 'Happy Patients', icon: '❤️' },
  { value: '30+', label: 'Cities Covered', icon: '🏙️' },
  { value: '4.9★', label: 'Average Rating', icon: '⭐' },
];

const VALUES = [
  { icon: Heart, title: 'Patient-First', desc: 'Every decision we make centers around improving patient outcomes and experience.', color: 'from-red-500 to-rose-600' },
  { icon: Shield, title: 'Trust & Safety', desc: 'All doctors are verified and credentialed. Your health data is encrypted and private.', color: 'from-blue-500 to-indigo-600' },
  { icon: Zap, title: 'Innovation', desc: 'We leverage AI and cutting-edge technology to revolutionize healthcare delivery.', color: 'from-amber-500 to-orange-600' },
  { icon: Globe, title: 'Accessibility', desc: 'Making quality healthcare accessible to everyone across Pakistan, regardless of location.', color: 'from-green-500 to-emerald-600' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 md:pt-28">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-accent-500 to-teal-500 text-white py-24 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black font-heading mb-6">
            Healthcare for <span className="text-yellow-300">Everyone</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            MediConnect AI is Pakistan&apos;s leading AI-powered doctor appointment platform, connecting patients with the best healthcare professionals across the country.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map(({ value, label, icon }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-7 text-center shadow-card">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">{value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-28">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl font-black font-heading text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            We believe that quality healthcare should not be a privilege. MediConnect AI was founded to bridge the gap between patients and doctors by leveraging artificial intelligence, making the process of finding and booking the right doctor as simple as a few taps.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {VALUES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex gap-4 sm:gap-5 p-6 sm:p-7 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-black font-heading mb-4">Ready to Transform Your Healthcare?</h2>
          <p className="text-white/80 mb-8 sm:mb-10 text-lg">Join thousands of patients who have already discovered the future of healthcare.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors">
              Get Started Free
            </Link>
            <Link href="/doctors" className="px-8 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-colors">
              Find a Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
