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
        <div className="w-10 h-10 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-300 text-sm">Verifying secure reset link...</p>
      </div>
    );
  }

  if (tokenInvalidError) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-heading">
          Reset Link Expired or Invalid
        </h2>
        <p className="text-gray-300 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
          {tokenInvalidError}
        </p>
        <div className="space-y-3">
          <Link
            href="/forgot-password"
            className="w-full inline-flex items-center justify-center py-3 px-4 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm shadow-lg shadow-primary-600/20"
          >
            Request a New Reset Link
          </Link>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 text-primary-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/10">
          <ShieldCheck className="w-7 h-7" />
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 font-heading tracking-tight">
        Reset Your Password
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6 max-w-sm mx-auto leading-relaxed">
        Choose a strong, new password for your MediConnect AI account.
      </p>

      {serverError && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('token')} />

        {/* New Password */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors z-10 p-1"
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
                    ok ? 'text-emerald-400' : 'text-gray-400'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors z-10 p-1"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-400 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-4 shadow-lg shadow-primary-600/20 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          {isSubmitting ? 'Updating password...' : 'Update Password'}
        </button>
      </form>

      <div className="mt-8 text-center pt-4 border-t border-white/10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to login
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
            <div className="w-10 h-10 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300 text-sm">Loading security check...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
