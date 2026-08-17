import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-gray-900 to-accent-950 flex items-center justify-center p-6 sm:p-8 md:p-12 relative overflow-hidden">
      <div className="blob w-96 h-96 bg-primary-500 -top-20 -left-20 opacity-20" />
      <div className="blob w-80 h-80 bg-accent-500 bottom-0 right-0 opacity-20" style={{ animationDelay: '4s' }} />
      <div className="relative w-full max-w-md my-8">
        <div className="text-center mb-8 sm:mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-white">MediConnect AI</span>
          </Link>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 md:p-12 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
