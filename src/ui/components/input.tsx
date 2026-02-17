import * as React from 'react';

import { cn } from '@/ui/utils/cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-md border border-gray-700 bg-gray-950/20 px-3 py-1 text-base outline-none transition-colors placeholder:text-gray-500 focus-within:bg-gray-900/20 hover:border-gray-600 disabled:pointer-events-none disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
