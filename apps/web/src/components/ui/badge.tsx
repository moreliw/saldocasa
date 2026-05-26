import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const badge = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      tone: {
        neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
        positive: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        negative: 'bg-rose-50 text-rose-700 ring-rose-200',
        warning: 'bg-amber-50 text-amber-800 ring-amber-200',
        info: 'bg-sky-50 text-sky-700 ring-sky-200',
        muted: 'bg-slate-50 text-slate-500 ring-slate-200',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}
