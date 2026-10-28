'use client';
import { useState, useEffect } from 'react';
import { cn, getInitials } from '@/lib/utils';
import Image from 'next/image';

export function Avatar({ src, name, size = 'md', className, online, ...props }) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-3xl',
  };

  const showImage = Boolean(src && !hasError);
  const isDataOrBlob = typeof src === 'string' && (src.startsWith('data:') || src.startsWith('blob:'));

  return (
    <div className={cn('relative inline-flex flex-shrink-0 select-none', className)} {...props}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-bold relative',
          sizes[size],
          !showImage && 'bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-inner'
        )}
      >
        {showImage ? (
          <Image
            src={src}
            alt={name || 'Avatar'}
            fill
            sizes="(max-width: 768px) 112px, 112px"
            unoptimized={isDataOrBlob}
            onError={() => setHasError(true)}
            className="object-cover"
          />
        ) : (
          <span aria-hidden="true">{getInitials(name)}</span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
            online ? 'bg-green-400' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
}
