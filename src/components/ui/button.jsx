import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg0 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-ink hover:bg-accent-hover',
        secondary:
          'border border-line-strong bg-transparent text-ink hover:bg-hover',
        ghost: 'text-ink-1 hover:bg-hover hover:text-ink',
        outline: 'border border-line text-ink hover:bg-hover',
        link: 'text-accent hover:text-accent-hover',
      },
      size: {
        default: 'h-10 px-5 text-sm',
        sm: 'h-8 gap-1.5 px-3 text-xs',
        lg: 'h-12 px-7 text-sm',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
