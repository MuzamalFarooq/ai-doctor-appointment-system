'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, KeyRound, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
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
        <div className="w-14 h-14 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-2xl flex items-center justify-center shadow-xs">
          <KeyRound className="w-7 h-7" />
        </div>
      </div>

      {!isSuccess ? (
        <>
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-2">
              Forgot Password?
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
              Enter your verified email address and we will send you secure, encrypted password reset instructions.
            </p>
          </div>

          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span className="font-medium">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="doctor@hospital.com"
                  {...register('email')}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border text-gray-900 dark:text-white placeholder:text-gray-400 text-sm transition-all shadow-xs focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-400/25'
                      : 'border-gray-200 dark:border-gray-700 focus:border-green-600 focus:ring-green-500/25'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-3 shadow-md shadow-green-700/20 hover:shadow-lg hover:shadow-green-700/25 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              <span>{isSubmitting ? 'Sending instructions...' : 'Send Reset Link'}</span>
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
            Check Your Email
          </h2>
          <p className="text-slate-600 dark:text-gray-300 text-sm mb-5 leading-relaxed">
            If an account is associated with{' '}
            <span className="text-gray-900 dark:text-white font-semibold break-all">
              {getValues('email') || 'your email'}
            </span>
            , you will receive password reset instructions shortly.
          </p>
          <div className="bg-green-50/70 dark:bg-green-950/30 border border-green-200/80 dark:border-green-800/40 rounded-2xl p-4 mb-6 text-xs text-slate-700 dark:text-gray-300 text-left space-y-2">
            <p className="flex items-center gap-1.5 font-medium text-green-900 dark:text-green-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 shrink-0" />
              The secure reset link remains valid for <strong>30 minutes</strong>.
            </p>
            <p className="flex items-center gap-1.5 font-medium text-green-900 dark:text-green-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 shrink-0" />
              Check your spam or junk folder if you don&apos;t receive it in 2 minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="text-sm text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold transition-colors cursor-pointer"
          >
            Need to try another email address? Click here
          </button>
        </div>
      )}

      <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to sign in</span>
        </Link>
      </div>
    </>
  );
}
