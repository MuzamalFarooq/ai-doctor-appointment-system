import Link from 'next/link';
import { Stethoscope, ShieldCheck, Lock, HeartHandshake } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDF4] via-white to-[#F7FEF8] dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/40 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-x-hidden py-10 sm:py-14 selection:bg-green-100 selection:text-green-900">
      {/* Decorative Healthcare Ambient Glows */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/40 dark:bg-emerald-900/15 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-200/35 dark:bg-green-900/15 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-100/20 dark:bg-emerald-950/10 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Main Column Container */}
      <div className="relative w-full max-w-md md:max-w-xl my-auto z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 justify-center group transition-transform duration-200 hover:scale-[1.02]"
            aria-label="MediConnect AI Home"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 flex items-center justify-center shadow-lg shadow-green-600/20 text-white transition-shadow group-hover:shadow-green-600/30">
              <Stethoscope className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="font-heading font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white tracking-tight">
              MediConnect <span className="text-green-600 dark:text-green-400">AI</span>
            </span>
          </Link>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full text-[11px] font-semibold bg-green-100/80 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-200/70 dark:border-green-800/60 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
            <span>AI-Powered Healthcare & Doctor Appointments</span>
          </div>
        </div>

        {/* Auth Content Card */}
        <div className="w-full bg-white dark:bg-gray-900/95 border border-green-100/90 dark:border-green-900/40 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_12px_40px_-12px_rgba(22,163,74,0.08),0_20px_25px_-5px_rgba(0,0,0,0.03)] dark:shadow-2xl relative transition-all">
          {children}
        </div>

        {/* Healthcare Security & Compliance Trust Bar */}
        <div className="mt-6 sm:mt-8 text-center flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
            256-Bit SSL Encrypted
          </span>
          <span className="text-slate-300 dark:text-gray-600">•</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
            HIPAA-Compliant Security
          </span>
          <span className="text-slate-300 dark:text-gray-600">•</span>
          <span className="inline-flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
            Verified Clinical Network
          </span>
        </div>
      </div>
    </div>
  );
}
