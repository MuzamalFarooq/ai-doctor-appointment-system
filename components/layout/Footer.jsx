import Link from 'next/link';
import {
  Stethoscope, Facebook, Twitter, Instagram, Linkedin, Youtube,
  Mail, Phone, MapPin, ArrowRight, Heart,
} from 'lucide-react';

const footerLinks = {
  platform: [
    { label: 'Find Doctors', href: '/doctors' },
    { label: 'AI Symptom Checker', href: '/ai-symptom-checker' },
    { label: 'AI Health Assistant', href: '/ai-health-assistant' },
    { label: 'Video Consultation', href: '/pricing' },
    { label: 'Pricing', href: '/pricing' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/about#careers' },
    { label: 'Press', href: '/about#press' },
    { label: 'Contact', href: '/contact' },
  ],
  support: [
    { label: 'Help Center', href: '/faq' },
    { label: 'Patient Guide', href: '/faq' },
    { label: 'Doctor Signup', href: '/register' },
    { label: 'Emergency', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ],
  specializations: [
    { label: 'General Physician', href: '/doctors?spec=General+Physician' },
    { label: 'Cardiologist', href: '/doctors?spec=Cardiologist' },
    { label: 'Dermatologist', href: '/doctors?spec=Dermatologist' },
    { label: 'Neurologist', href: '/doctors?spec=Neurologist' },
    { label: 'Pediatrician', href: '/doctors?spec=Pediatrician' },
  ],
};

const socials = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-20 sm:mt-24 border-t border-gray-900">
      {/* Newsletter Banner */}
      <div className="border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-gradient-to-r from-primary-900/60 to-accent-900/60 rounded-3xl p-8 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 border border-primary-800/50 shadow-2xl my-2">
            <div className="space-y-3 text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
                Stay Healthy with AI Insights
              </h3>
              <p className="text-gray-300 text-sm sm:text-base max-w-xl">
                Get weekly health tips, doctor recommendations, and wellness guides delivered to your inbox.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto min-w-full sm:min-w-[420px]">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 backdrop-blur-sm text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all hover:shadow-glow flex items-center justify-center gap-2 whitespace-nowrap text-sm cursor-pointer"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-8">
          {/* Brand Column Box */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-gray-900/40 border border-gray-800/60 backdrop-blur-sm flex flex-col justify-between shadow-lg">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading font-bold text-xl text-white tracking-tight">MediConnect AI</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                Pakistan&apos;s leading AI-powered healthcare platform connecting patients with top doctors for smarter, faster, and more accessible medical care.
              </p>
              {/* Contact Info Box */}
              <div className="space-y-3.5 text-sm mb-6 bg-gray-950/60 p-4 rounded-2xl border border-gray-800/40">
                <div className="flex items-center gap-3.5 text-gray-400 hover:text-gray-300 transition-colors">
                  <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span>Blue Area, Islamabad, Pakistan</span>
                </div>
                <div className="flex items-center gap-3.5 text-gray-400 hover:text-gray-300 transition-colors">
                  <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span>+92 306 7774327</span>
                </div>
                <div className="flex items-center gap-3.5 text-gray-400 hover:text-gray-300 transition-colors">
                  <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span>muzamalfarooq786@gmail.com</span>
                </div>
              </div>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3 flex-wrap pt-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:border-primary-500 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Column Boxes */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="p-6 rounded-3xl bg-gray-900/40 border border-gray-800/60 backdrop-blur-sm space-y-4 hover:border-gray-700/60 transition-all duration-300 flex flex-col justify-between shadow-lg">
              <div>
                <h4 className="text-white font-semibold text-xs sm:text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-800/80">
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </h4>
                <ul className="space-y-3.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200 inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* App Store & Trust Badges Container Box */}
        <div className="border-t border-gray-800/80 mt-16 sm:mt-20 pt-10 sm:pt-12">
          <div className="bg-gray-900/40 border border-gray-800/60 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 backdrop-blur-sm shadow-lg">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
              <a href="#" className="flex items-center gap-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white px-5 py-3.5 rounded-2xl transition-all hover:border-gray-700 shadow-sm hover:scale-[1.02]">
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Download on the</p>
                  <p className="text-sm font-semibold leading-tight">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white px-5 py-3.5 rounded-2xl transition-all hover:border-gray-700 shadow-sm hover:scale-[1.02]">
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76c.37.2.8.24 1.2.1L14.9 12 4.38.14c-.4-.14-.83-.1-1.2.1C2.44.66 2 1.56 2 2.56v18.88c0 1 .44 1.9 1.18 2.32M16 13.06L5.88 23.18l9.98-5.75zM20.82 9.1L17.7 7.3 14.1 11l3.6 3.7 3.12-1.8c.9-.52.9-1.64.9-2.4s0-1.88-.9-2.4M5.88.82L16 10.94l3.7-3.7z"/>
                </svg>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Get it on</p>
                  <p className="text-sm font-semibold leading-tight">Google Play</p>
                </div>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
              {['HIPAA Compliant', 'ISO 27001', 'SSL Secured', 'PMC Verified'].map(badge => (
                <div key={badge} className="flex items-center gap-2.5 bg-gray-900/90 border border-gray-800/80 px-4 py-2.5 rounded-2xl shadow-sm hover:border-gray-700 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-gray-300">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-12 pt-8 border-t border-gray-800/60 text-center md:text-left">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MediConnect AI. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-primary-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-primary-400 transition-colors">Terms of Service</Link>
              <Link href="/faq" className="text-gray-400 hover:text-primary-400 transition-colors">FAQ</Link>
            </div>
            <p className="text-gray-500 text-xs flex items-center gap-1.5 justify-center">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in Pakistan
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

