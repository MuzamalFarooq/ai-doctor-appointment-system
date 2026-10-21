'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { 
  User, Mail, Lock, Eye, EyeOff, UserCheck, Stethoscope, 
  CheckCircle, Info, AlertCircle, ArrowRight, ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { registerSchema } from '@/lib/validators';
import { registerUser } from '@/actions/auth.actions';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('PATIENT');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'PATIENT' },
  });

  const password = watch('password', '');
  const strengthChecks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data) => {
    try {
      const normalizedEmail = data.email.toLowerCase().trim();
      const result = await registerUser({ ...data, email: normalizedEmail, role });
      if (!result?.success) {
        toast.error(result?.error || 'Registration could not be completed. Please try again.');
        return;
      }
      toast.success('Account created! Signing you in...');
      const res = await signIn('credentials', { email: normalizedEmail, password: data.password, redirect: false });
      if (!res?.ok || res.error) {
        toast.error('Registered successfully! Please sign in.');
        router.replace('/login');
      } else {
        window.location.href = '/auth/redirect';
      }
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleGoogle = () => signIn('google', { callbackUrl: '/auth/redirect' });

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-2">
          Create Account
        </h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm">
          Join 10,000+ patients and 500+ doctors on MediConnect AI
        </p>
      </div>

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { 
            value: 'PATIENT', 
            label: 'Patient', 
            icon: UserCheck, 
            desc: 'Book appointments & consult online' 
          },
          { 
            value: 'DOCTOR', 
            label: 'Doctor', 
            icon: Stethoscope, 
            desc: 'Join as healthcare provider' 
          },
        ].map(({ value, label, icon: Icon, desc }) => {
          const isSelected = role === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRole(value);
                setValue('role', value);
              }}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-green-600 bg-green-50/90 dark:bg-green-950/40 ring-1 ring-green-600 shadow-xs'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-green-300 dark:hover:border-green-800 hover:bg-green-50/30'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-750 text-slate-500 dark:text-gray-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/60 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <div>
                <p className={`text-sm font-bold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {label}
                </p>
                <p className={`text-xs mt-0.5 ${isSelected ? 'text-green-800/90 dark:text-green-300' : 'text-slate-500 dark:text-gray-400'}`}>
                  {desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {role === 'DOCTOR' && (
        <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3.5 mb-6 text-amber-900 dark:text-amber-200">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-medium">
            Doctor accounts undergo fast administrative verification before accepting patient bookings. You will receive an email update once verified.
          </p>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-semibold transition-all mb-5 text-sm shadow-xs cursor-pointer"
        aria-label="Continue with Google"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
        <span className="text-slate-400 text-xs uppercase tracking-wider font-medium">or register with email</span>
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              type="text"
              autoComplete="name"
              placeholder="Dr. Sarah Jenkins or John Doe"
              {...register('name')}
              className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border text-gray-900 dark:text-white placeholder:text-gray-400 text-sm transition-all shadow-xs focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-400/25'
                  : 'border-gray-200 dark:border-gray-700 focus:border-green-600 focus:ring-green-500/25'
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.name.message}</span>
            </p>
          )}
        </div>

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
              placeholder="you@example.com"
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
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Password
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

          {/* Password strength checklist */}
          {password && (
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-2.5 px-0.5">
              {strengthChecks.map(({ label, ok }) => (
                <div 
                  key={label} 
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
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
            Confirm Password
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
          className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-3 shadow-md shadow-green-700/20 hover:shadow-lg hover:shadow-green-700/25 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4 shrink-0" />
          )}
          <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
        </button>
      </form>

      {/* Account Navigation */}
      <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800 text-center space-y-3">
        <p className="text-slate-600 dark:text-gray-400 text-sm">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
        <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-green-700 dark:text-green-400 underline hover:text-green-800 transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-green-700 dark:text-green-400 underline hover:text-green-800 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </>
  );
}
