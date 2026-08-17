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
    <footer className="bg-gray-950 text-gray-300">
      {/* Newsletter Banner */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-primary-900/60 to-accent-900/60 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 border border-primary-800/50">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white font-heading mb-2">
                Stay Healthy with AI Insights
              </h3>
              <p className="text-gray-300 text-sm">
                Get weekly health tips, doctor recommendations, and wellness guides.
              </p>
            </div>
            <form className="flex gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-72 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 backdrop-blur-sm text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all hover:shadow-glow flex items-center gap-2 whitespace-nowrap text-sm"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">MediConnect AI</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Pakistan&apos;s leading AI-powered healthcare platform connecting patients with top doctors for smarter, faster, and more accessible medical care.
            </p>
            {/* Contact Info */}
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>Blue Area, Islamabad, Pakistan</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>+92 51 1234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>hello@mediconnect.ai</span>
              </div>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3.5 mt-7">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </h4>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Store Badges */}
        <div className="border-t border-gray-800 mt-16 pt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <a href="#" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-xl transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-xs text-gray-400">Download on the</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-xl transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76c.37.2.8.24 1.2.1L14.9 12 4.38.14c-.4-.14-.83-.1-1.2.1C2.44.66 2 1.56 2 2.56v18.88c0 1 .44 1.9 1.18 2.32M16 13.06L5.88 23.18l9.98-5.75zM20.82 9.1L17.7 7.3 14.1 11l3.6 3.7 3.12-1.8c.9-.52.9-1.64.9-2.4s0-1.88-.9-2.4M5.88.82L16 10.94l3.7-3.7z"/>
                </svg>
                <div>
                  <p className="text-xs text-gray-400">Get it on</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {['HIPAA Compliant', 'ISO 27001', 'SSL Secured', 'PMC Verified'].map(badge => (
                <div key={badge} className="flex items-center gap-1.5 bg-gray-800 px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-400">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-800/50">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MediConnect AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-500 hover:text-gray-300 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">Terms</Link>
              <Link href="/faq" className="text-gray-500 hover:text-gray-300 transition-colors">FAQ</Link>
            </div>
            <p className="text-gray-600 text-xs flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in Pakistan
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
