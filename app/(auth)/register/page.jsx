'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, Eye, EyeOff, UserCheck, Stethoscope, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerSchema } from '@/lib/validators';
import { registerUser } from '@/actions/auth.actions';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('PATIENT');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
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
      const result = await registerUser({ ...data, role });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Account created! Signing you in...');
      await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      router.push(role === 'DOCTOR' ? '/doctor/dashboard' : '/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleGoogle = () => signIn('google', { callbackUrl: '/dashboard' });

  return (
    <>
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 font-heading tracking-tight">
        Create Account
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        Join 10,000+ patients and 500+ doctors on MediConnect AI
      </p>

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-3.5 mb-6">
        {[
          { value: 'PATIENT', label: 'Patient', icon: UserCheck, desc: 'Book appointments' },
          { value: 'DOCTOR', label: 'Doctor', icon: Stethoscope, desc: 'Join as provider' },
        ].map(({ value, label, icon: Icon, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
              role === value
                ? 'border-primary-400 bg-primary-500/20 shadow-lg shadow-primary-500/10'
                : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25'
            }`}
          >
            <Icon className={`w-5 h-5 mb-2 ${role === value ? 'text-primary-400' : 'text-gray-400'}`} />
            <div>
              <p className={`text-sm font-semibold ${role === value ? 'text-white' : 'text-gray-300'}`}>{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {role === 'DOCTOR' && (
        <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 mb-6">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-amber-300">
            Doctor accounts require admin approval before you can start accepting patients. You&apos;ll be notified by email.
          </p>
        </div>
      )}

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all mb-5 text-sm cursor-pointer"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <hr className="flex-1 border-white/15" />
        <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">or register with email</span>
        <hr className="flex-1 border-white/15" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="John Doe"
              {...register('name')}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm transition-all"
            />
          </div>
          {errors.name && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm transition-all"
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
              type={showPassword ? 'text' : 'password'}
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
                <div key={label} className={`flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-emerald-400' : 'text-gray-400'}`}>
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
          {errors.password && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm transition-all"
            />
          </div>
          {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-3 shadow-lg shadow-primary-600/20 cursor-pointer"
        >
          {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
      <p className="text-center text-gray-400 text-xs mt-4 leading-relaxed">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-gray-300 transition-colors">Terms</Link>{' '}and{' '}
        <Link href="/privacy-policy" className="underline hover:text-gray-300 transition-colors">Privacy Policy</Link>
      </p>
    </>
  );
}

