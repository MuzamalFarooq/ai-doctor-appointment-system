'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPasswordSchema } from '@/lib/validators';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenInvalidError, setTokenInvalidError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password', '');
  const strengthChecks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ];

  // Verify token validity on mount
  useEffect(() => {
    if (!token) {
      setTokenInvalidError('No reset token was provided. Please request a new password reset link.');
      setIsValidatingToken(false);
      return;
    }

    setValue('token', token);

    let isMounted = true;
    async function verifyToken() {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => null);
        if (!isMounted) return;

        if (!res.ok || !data?.valid) {
          setTokenInvalidError(data?.error || 'This reset link is invalid or has expired.');
        }
      } catch {
        // If network check fails, allow user to attempt submission
      } finally {
        if (isMounted) setIsValidatingToken(false);
      }
    }

    verifyToken();
    return () => {
      isMounted = false;
    };
  }, [token, setValue]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: data.token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = result?.error || 'Failed to reset password. Please request a new link.';
        setServerError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success('Password updated successfully!');
      router.replace('/login?reset=success');
    } catch {
      const msg = 'Network error. Please check your connection and try again.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="py-12 text-center">
        <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 dark:text-gray-300 text-sm font-medium">Verifying secure reset token...</p>
      </div>
    );
  }

  if (tokenInvalidError) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
          Reset Link Expired or Invalid
        </h2>
        <p className="text-slate-600 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
          {tokenInvalidError}
        </p>
        <div className="space-y-3">
          <Link
            href="/forgot-password"
            className="w-full inline-flex items-center justify-center py-3.5 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-xl transition-all text-sm shadow-md shadow-green-700/20 hover:shadow-lg hover:shadow-green-700/25 cursor-pointer"
          >
            Request a New Reset Link
          </Link>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-green-700 dark:hover:text-green-400 text-sm font-medium transition-colors mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to sign in</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-2xl flex items-center justify-center shadow-xs">
          <ShieldCheck className="w-7 h-7" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-2">
          Reset Your Password
        </h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
          Choose a strong, confidential password for your MediConnect AI account.
        </p>
      </div>

      {serverError && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <span className="font-medium">{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register('token')} />

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-11 pr-11 py-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border text-gray-900 dark:text-white placeholder:text-gray-400 text-sm transition-all shadow-xs focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-400/25'
                  : 'border-gray-200 dark:border-gray-700 focus:border-green-600 focus:ring-green-500/25'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10 p-1 rounded-md"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-2.5 px-0.5">
              {strengthChecks.map(({ label, ok }) => (
                <div
                  key={label}
                  className={`flex items-center gap-1.5 text-xs font-medium ${
                    ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-gray-600'}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.password.message}</span>
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full pl-11 pr-11 py-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border text-gray-900 dark:text-white placeholder:text-gray-400 text-sm transition-all shadow-xs focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-400/25'
                  : 'border-gray-200 dark:border-gray-700 focus:border-green-600 focus:ring-green-500/25'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10 p-1 rounded-md"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.confirmPassword.message}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-4 shadow-md shadow-green-700/20 hover:shadow-lg hover:shadow-green-700/25 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          <span>{isSubmitting ? 'Updating password...' : 'Update Password'}</span>
        </button>
      </form>

      <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-green-700 dark:hover:text-green-400 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to sign in</span>
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <Suspense
        fallback={
          <div className="py-12 text-center">
            <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-gray-300 text-sm font-medium">Loading security check...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
