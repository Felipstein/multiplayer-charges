/* eslint-disable react/button-has-type */

import type { ComponentProps, ElementType } from 'react';

import type { ClassNames } from '../utils/class-names';
import buildClassNames from '../utils/class-names';

import { LoaderSpinner } from './loader-spinner';

import { cn } from '@/ui/utils/cn';

type Props = Omit<ComponentProps<'button'>, 'className'> & {
  variant?: 'default' | 'outline' | 'ghost';
  color?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  className?: ClassNames<'root' | 'content' | 'loaderRoot' | 'loaderIcon'>;
};

export function Button({
  variant = 'default',
  color = 'primary',
  isLoading = false,
  type = 'button',
  disabled = false,
  className,
  children,
  ...props
}: Props) {
  const getClassName = buildClassNames(className, 'root');

  return (
    <button
      type={type}
      data-slot="button"
      disabled={disabled || isLoading}
      className={cn(
        'relative flex h-9 shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium outline-none transition-all enabled:cursor-pointer enabled:focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        {
          'enabled:focus-visible:ring-blue-400': color === 'primary',
          'enabled:focus-visible:ring-gray-400': color === 'secondary',
          'enabled:focus-visible:ring-red-400': color === 'danger',
        },
        {
          'bg-blue-600 text-blue-50 shadow shadow-blue-950 active:shadow-blue-900/50 enabled:hover:bg-blue-500 enabled:hover:shadow-lg enabled:hover:shadow-blue-950/10':
            variant === 'default' && color === 'primary',
          'border-1 border-gray-600 bg-gray-800 text-gray-50 shadow shadow-gray-950 active:shadow-gray-900/50 enabled:hover:border-gray-500 enabled:hover:bg-gray-700 enabled:hover:shadow-lg enabled:hover:shadow-gray-950/10':
            variant === 'default' && color === 'secondary',
          'bg-red-700 text-zinc-50 shadow shadow-red-950 active:shadow-red-900/50 enabled:hover:bg-red-600 enabled:hover:shadow-lg enabled:hover:shadow-red-950/10':
            variant === 'default' && color === 'danger',
        },
        {
          'border border-blue-500 text-blue-400 shadow shadow-blue-950 enabled:hover:border-blue-400 enabled:hover:bg-blue-950/20 enabled:hover:text-blue-300':
            variant === 'outline' && color === 'primary',
          'border border-gray-300 text-gray-200 shadow shadow-gray-950 enabled:hover:border-gray-200 enabled:hover:bg-gray-900/35 enabled:hover:text-gray-50':
            variant === 'outline' && color === 'secondary',
          'border border-red-400 text-red-400 shadow shadow-red-950 enabled:hover:border-red-300 enabled:hover:bg-red-950/20 enabled:hover:text-red-300':
            variant === 'outline' && color === 'danger',
        },
        {
          'text-blue-400 enabled:hover:border-blue-400 enabled:hover:bg-blue-950/20 enabled:hover:text-blue-300':
            variant === 'ghost' && color === 'primary',
          'text-gray-200 enabled:hover:border-gray-200 enabled:hover:bg-gray-900/35 enabled:hover:text-gray-50':
            variant === 'ghost' && color === 'secondary',
          'text-red-400 enabled:hover:border-red-300 enabled:hover:bg-red-950/20 enabled:hover:text-red-300':
            variant === 'ghost' && color === 'danger',
        },
        getClassName('root'),
      )}
      {...props}
    >
      <div
        data-loading={isLoading}
        className={cn(
          'absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 data-[loading=true]:block',
          getClassName('loaderRoot'),
        )}
      >
        <ButtonIcon icon={LoaderSpinner} className={getClassName('loaderIcon')} />
      </div>

      <div
        data-loading={isLoading}
        className={cn(
          'transition-transform data-[loading=true]:translate-y-[150%]',
          getClassName('content'),
        )}
      >
        {children}
      </div>
    </button>
  );
}

type ButtonIconProps = ComponentProps<'svg'> & {
  icon: ElementType<{ className?: string }>;
};

function ButtonIcon({ icon: Icon, className, ...props }: ButtonIconProps) {
  // @ts-expect-error
  return <Icon className={cn(className, 'size-5')} {...props} />;
}

Button.Icon = ButtonIcon;
