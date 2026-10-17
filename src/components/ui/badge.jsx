import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'border-line bg-bg2 text-ink-1',
        accent: 'border-accent bg-transparent text-accent',
        outline: 'border-line text-ink-2',
        success: 'border-success bg-transparent text-success',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
