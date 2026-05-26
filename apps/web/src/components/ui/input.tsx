'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-card transition-colors',
          'placeholder:text-slate-400',
          'focus-ring focus:border-brand-900',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          'invalid:border-rose-500 invalid:text-rose-700',
          className,
        )}
        {...props}
      />
    );
  },
);
