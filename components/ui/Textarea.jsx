import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  { className, label, error, hint, rows = 4, ...props }, ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm resize-none',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700',
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
    </div>
  );
});
