'use client';

import React from 'react';
import { Stethoscope, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MediConnect AI Premium Loading Experience
 *
 * Implements a clinical-grade, modern healthcare AI loading screen:
 * - Brand palette: Primary green (#059669), Deep forest (#065F46), Light green (#ECFDF5), Subtle border (#D1E7DD)
 * - Rotating SVG progress rings with AI pulse halo
 * - Modern medical insignia with Stethoscope and AI intelligence sparkle
 * - Indeterminate progress bar (no fabricated percentages)
 * - Full reduced-motion accessibility support
 */
export function MediConnectLoader({
  variant = 'full', // 'full' | 'embedded' | 'compact' | 'inline'
  text = 'Preparing your healthcare experience...',
  subtitle = 'Your health, intelligently connected.',
  showBrand = true,
  showProgress = true,
  className = '',
}) {
  const isFull = variant === 'full';
  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  // Inline mini-spinner variant (e.g. for inside buttons or small chips)
  if (isInline) {
    return (
      <div className={cn('inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium text-sm', className)} role="status" aria-live="polite">
        <svg className="w-4 h-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#D1E7DD" strokeWidth="3" />
          <path className="opacity-90" fill="#059669" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>{text}</span>
      </div>
    );
  }

  // Compact card variant (e.g. for modals or widgets)
  if (isCompact) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-[#D1E7DD] dark:border-emerald-900/50 shadow-sm backdrop-blur-sm',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={text}
      >
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/60 mc-animate-pulse-halo motion-reduce:animate-none pointer-events-none" />
          <svg className="w-14 h-14 -rotate-90 mc-animate-spin motion-reduce:animate-none" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" stroke="#D1E7DD" strokeWidth="3" fill="none" className="dark:stroke-emerald-950" />
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="#059669"
              strokeWidth="3.5"
              strokeDasharray="100 65"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div className="absolute w-8 h-8 rounded-lg bg-gradient-to-br from-[#059669] to-[#065F46] flex items-center justify-center text-white shadow-xs">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="mt-3 text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{text}</p>
      </div>
    );
  }

  // Standard 'full' or 'embedded' experience
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center select-none transition-all duration-300',
        isFull
          ? 'fixed inset-0 z-50 min-h-screen w-screen bg-gradient-to-b from-white via-[#F6FCF8] to-[#ECFDF5] dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/40 p-6'
          : 'w-full py-14 px-4 rounded-3xl bg-gradient-to-b from-white to-[#ECFDF5]/40 dark:from-gray-900 dark:to-gray-900/60 border border-[#D1E7DD]/70 dark:border-emerald-900/40 shadow-xs',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading MediConnect AI"
    >
      {/* Background ambient medical glows */}
      {isFull && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[560px] h-[420px] sm:h-[560px] rounded-full bg-emerald-200/30 dark:bg-emerald-600/10 blur-3xl mc-animate-pulse-halo motion-reduce:animate-none" />
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-teal-200/20 dark:bg-teal-600/5 blur-2xl" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center max-w-sm sm:max-w-md text-center">
        {/* Animated Medical AI Logo Badge */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mb-6">
          {/* Subtle green breathing aura halo */}
          <div
            className="absolute inset-0 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/70 border border-[#D1E7DD]/60 dark:border-emerald-800/40 mc-animate-pulse-halo motion-reduce:animate-none pointer-events-none"
            aria-hidden="true"
          />

          {/* Secondary AI Outer Precision Ring (counter-rotating) */}
          <svg
            className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] mc-animate-spin-reverse motion-reduce:animate-none opacity-60 dark:opacity-40 pointer-events-none"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#059669"
              strokeWidth="1.2"
              strokeDasharray="4 8"
            />
          </svg>

          {/* Primary Circular Progress Indicator (rotating emerald track) */}
          <svg
            className="relative w-24 h-24 sm:w-28 sm:h-28 -rotate-90 mc-animate-spin motion-reduce:animate-none"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="mc-emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="60%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
            {/* Background circular guide */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#D1E7DD"
              strokeWidth="4"
              fill="none"
              className="dark:stroke-emerald-950/80"
            />
            {/* Active animated emerald stroke */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#mc-emerald-gradient)"
              strokeWidth="4.5"
              strokeDasharray="160 90"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Central Medical Cross & Stethoscope Insignia */}
          <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#059669] via-[#047857] to-[#065F46] p-0.5 shadow-xl shadow-emerald-900/25 dark:shadow-emerald-950/50 flex items-center justify-center transform transition-transform motion-safe:hover:scale-105">
            <div className="relative w-full h-full rounded-[14px] bg-gradient-to-br from-[#059669] to-[#065F46] flex items-center justify-center">
              {/* Medical Cross Graphic Accent in Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none" aria-hidden="true">
                <div className="w-7 h-2 bg-white rounded-full" />
                <div className="w-2 h-7 bg-white rounded-full absolute" />
              </div>

              {/* Foreground Stethoscope Symbol */}
              <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10 drop-shadow-sm" />

              {/* AI Sparkle Badge on top right */}
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border border-[#D1E7DD] dark:border-emerald-700 flex items-center justify-center shadow-xs">
                <Sparkles className="w-3 h-3 text-[#059669] dark:text-emerald-400" />
              </span>
            </div>
          </div>
        </div>

        {/* Brand Name Typography */}
        {showBrand && (
          <div className="mb-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1F2937] dark:text-white tracking-tight flex items-center justify-center gap-2">
              <span>MediConnect</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#ECFDF5] dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-400 border border-[#D1E7DD] dark:border-emerald-800/60 shadow-xs">
                AI
              </span>
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm font-medium text-emerald-800/80 dark:text-emerald-300/80 tracking-wide mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Indeterminate Animated Progress Line */}
        {showProgress && (
          <div className="w-44 sm:w-56 mt-4">
            <div
              className="relative w-full h-1.5 rounded-full bg-[#D1E7DD]/70 dark:bg-emerald-950 overflow-hidden border border-[#D1E7DD]/50 dark:border-emerald-900/40"
              aria-hidden="true"
            >
              <div
                className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#059669] to-emerald-400 mc-animate-indeterminate motion-reduce:animate-none"
              />
            </div>
          </div>
        )}

        {/* Dynamic Status Text with Animated 3-Dot Indicator */}
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mt-4">
          <span>{text}</span>
          <span className="inline-flex items-center gap-1 ml-0.5" aria-hidden="true">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-emerald-400 mc-animate-dot motion-reduce:animate-none" style={{ animationDelay: '0s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-emerald-400 mc-animate-dot motion-reduce:animate-none" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-emerald-400 mc-animate-dot motion-reduce:animate-none" style={{ animationDelay: '0.4s' }} />
          </span>
        </div>

        {/* Clinical Privacy & Trust Seal */}
        {isFull && (
          <p className="mt-8 text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#059669]" />
            Secure Encrypted Health Connection
          </p>
        )}
      </div>
    </div>
  );
}

export default MediConnectLoader;
