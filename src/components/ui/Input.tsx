'use client';

import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'input',
              icon && 'pl-10',
              error && 'border-highlight-red focus:ring-highlight-red',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-highlight-red font-dm">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
