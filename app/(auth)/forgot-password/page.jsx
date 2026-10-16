'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPasswordSchema } from '@/lib/validators';

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.trim().toLowerCase() }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = result?.error || 'Unable to process your request. Please try again.';
        setServerError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      setIsSuccess(true);
      toast.success('Reset instructions sent if an account exists.');
    } catch {
      const msg = 'Network error. Please check your connection and try again.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 text-primary-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/10">
          <KeyRound className="w-7 h-7" />
        </div>
      </div>

      {!isSuccess ? (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 font-heading tracking-tight">
            Forgot Password?
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6 max-w-sm mx-auto leading-relaxed">
            Enter the email associated with your MediConnect AI account, and we will send you secure reset instructions.
          </p>

          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="doctor@hospital.com"
                  {...register('email')}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-3 shadow-lg shadow-primary-600/20 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {isSubmitting ? 'Sending instructions...' : 'Send Reset Link'}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-2">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 font-heading">
            Check Your Email
          </h2>
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            If an account exists for{' '}
            <span className="text-white font-medium break-all">
              {getValues('email') || 'your email'}
            </span>
            , password reset instructions will be sent.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 mb-6 text-xs text-gray-400 text-left space-y-1.5">
            <p>• The reset link remains valid for <strong>30 minutes</strong>.</p>
            <p>• Be sure to check your spam or junk folder if you don't see it shortly.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors cursor-pointer"
          >
            Need to try another email? Click here
          </button>
        </div>
      )}

      <div className="mt-8 text-center pt-4 border-t border-white/10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </>
  );
}
