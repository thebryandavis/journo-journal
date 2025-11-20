'use client';

import React from 'react';
import clsx from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'input min-h-[120px] resize-y',
            error && 'border-highlight-red focus:ring-highlight-red',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-highlight-red font-dm">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
