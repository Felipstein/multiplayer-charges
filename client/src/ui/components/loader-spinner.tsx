import { Loader2Icon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '../utils/cn';

export function LoaderSpinner({ className, ...props }: ComponentProps<typeof Loader2Icon>) {
  return <Loader2Icon className={cn('size-6 animate-spin', className)} {...props} />;
}
