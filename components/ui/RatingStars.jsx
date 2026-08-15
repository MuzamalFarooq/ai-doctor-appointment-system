import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({ rating, max = 5, size = 'sm', interactive = false, onChange, className }) {
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            sizes[size],
            'transition-colors',
            i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600',
            interactive && 'cursor-pointer hover:text-amber-400 hover:fill-amber-400',
          )}
          onClick={interactive ? () => onChange?.(i + 1) : undefined}
        />
      ))}
    </div>
  );
}
