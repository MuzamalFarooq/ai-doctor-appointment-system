import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function Button({
  children, className, variant = 'primary', size = 'md',
  loading = false, disabled, leftIcon, rightIcon, ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95';

  const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-green-50 hover:bg-green-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-green-900 dark:text-green-300 border border-green-200 dark:border-green-800',
    outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    gradient: 'text-white shadow-sm hover:shadow-md',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg',
    icon: 'w-10 h-10',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], variant === 'gradient' && 'bg-gradient-to-r from-green-600 to-green-800', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
