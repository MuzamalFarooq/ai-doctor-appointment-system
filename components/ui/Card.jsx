import { cn } from '@/lib/utils';

export function Card({ children, className, hover = false, glass = false, gradient = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border',
        glass
          ? 'bg-white/10 dark:bg-white/5 backdrop-blur-xl border-white/20'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-card dark:shadow-card-dark',
        gradient && 'bg-gradient-to-br from-white to-primary-50/50 dark:from-gray-800 dark:to-primary-950/50',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-2xl cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return <div className={cn('p-6 pb-0', className)} {...props}>{children}</div>;
}

export function CardContent({ children, className, ...props }) {
  return <div className={cn('p-6', className)} {...props}>{children}</div>;
}

export function CardFooter({ children, className, ...props }) {
  return <div className={cn('px-6 py-4 border-t border-gray-100 dark:border-gray-700', className)} {...props}>{children}</div>;
}
