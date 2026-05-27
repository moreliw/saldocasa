'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-ring disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-brand-900 text-white shadow-card hover:bg-brand-800',
        secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-card',
        ghost: 'text-slate-700 hover:bg-slate-100',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-card',
        outline: 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, loading, disabled, children, ...props },
  ref,
) {
  // Quando asChild=true, Radix Slot exige exatamente UM child React element.
  // Passamos os filhos do consumidor direto; loading state vira só visual via opacity.
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={cn(buttonVariants({ variant, size }), loading && 'pointer-events-none opacity-60', className)}
        {...props}
      >
        {children as React.ReactElement}
      </Slot>
    );
  }
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
