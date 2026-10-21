'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginSchema } from '@/lib/validators';
import { MediConnectLoader } from '@/components/ui/MediConnectLoader';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const reset = searchParams.get('reset');
    if (reset === 'success') {
      toast.success('Your password has been reset successfully. Please sign in with your new password.', {
        duration: 6000,
      });
    }

    const error = searchParams.get('error');
    if (error) {
      if (error === 'OAuthSignin' || error === 'OAuthCallback') {
        toast.error('Google sign-in was cancelled or failed. Please check your Google OAuth configuration.');
      } else if (error === 'OAuthAccountNotLinked') {
        toast.error('Email already in use with another login provider.');
      } else if (error === 'AccessDenied') {
        toast.error('Access denied. Please check your account status.');
      } else if (error === 'Configuration') {
        toast.error('Authentication configuration error. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
      } else {
        toast.error(`Authentication error: ${error}`);
      }
    }
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const normalizedEmail = data.email.toLowerCase().trim();
      const result = await signIn('credentials', {
        email: normalizedEmail,
        password: data.password,
        redirect: false,
      });
      if (!result?.ok || result.error) {
        toast.error(
          result?.error === 'CredentialsSignin'
            ? 'Invalid email or password'
            : 'Unable to sign in right now. Please try again shortly.'
        );
      } else {
        toast.success('Welcome back!');
        const callbackUrl = searchParams.get('callbackUrl');
        const params = new URLSearchParams();
        if (callbackUrl) params.set('callbackUrl', callbackUrl);
        const query = params.toString();
        window.location.href = query ? `/auth/redirect?${query}` : '/auth/redirect';
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const callbackUrl = searchParams.get('callbackUrl');
      const redirectUrl = callbackUrl
        ? `/auth/redirect?${new URLSearchParams({ callbackUrl }).toString()}`
        : '/auth/redirect';
      await signIn('google', { callbackUrl: redirectUrl });
    } catch {
      toast.error('Google sign-in failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-2">
          Welcome Back
        </h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm">
          Sign in to access your MediConnect AI appointments and health portal
        </p>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-medium transition-all mb-5 text-sm shadow-xs cursor-pointer disabled:opacity-60"
        aria-label="Continue with Google"
      >
        {googleLoading ? (
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        <span className="font-semibold text-gray-700 dark:text-gray-200">Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
        <span className="text-slate-400 text-xs uppercase tracking-wider font-medium">or sign in with email</span>
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Address */}
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Link 
              href="/forgot-password" 
              className="text-xs font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-600 dark:hover:text-gray-200 z-10 p-1 rounded-md transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.password.message}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:shadow-green-700/20 text-sm disabled:opacity-60 cursor-pointer mt-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn className="w-4 h-4 shrink-0" />
          )}
          <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
        </button>
      </form>

      <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-slate-600 dark:text-gray-400 text-sm">
          Don&apos;t have an account?{' '}
          <Link 
            href="/register" 
            className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <MediConnectLoader 
          variant="compact" 
          text="Loading sign in..." 
          className="bg-transparent border-none shadow-none py-8" 
        />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
