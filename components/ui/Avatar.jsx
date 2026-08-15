import { cn, getInitials } from '@/lib/utils';
import Image from 'next/image';

export function Avatar({ src, name, size = 'md', className, online, ...props }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl', '2xl': 'w-28 h-28 text-3xl' };
  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)} {...props}>
      <div className={cn('rounded-full overflow-hidden flex items-center justify-center font-bold', sizes[size],
        !src && 'bg-gradient-to-br from-primary-500 to-accent-500 text-white'
      )}>
        {src ? (
          <Image src={src} alt={name || 'Avatar'} fill className="object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {online !== undefined && (
        <span className={cn('absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800', online ? 'bg-green-400' : 'bg-gray-400')} />
      )}
    </div>
  );
}
