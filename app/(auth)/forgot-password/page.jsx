'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 1500));
      setIsSuccess(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 bg-primary-500/20 text-primary-400 rounded-2xl flex items-center justify-center">
          <KeyRound className="w-6 h-6" />
        </div>
      </div>
      
      {!isSuccess ? (
        <>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Forgot Password?</h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            No worries, we'll send you reset instructions.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-2"
            >
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {isSubmitting ? 'Sending...' : 'Reset Password'}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-gray-400 text-sm mb-6">
            We've sent a password reset link to <span className="text-white font-medium">{email}</span>
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-sm text-primary-400 hover:text-primary-300 font-medium"
          >
            Didn't receive the email? Click to resend
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </>
  );
}
