'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input-base ${error ? 'border-red-400 dark:border-red-700 focus:border-red-500' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-500 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#a3a3a3] dark:text-[#525252]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, showCount, maxLength, id, className = '', value, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={`input-base resize-none min-h-[100px] ${error ? 'border-red-400 dark:border-red-700' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        <div className="flex justify-between items-center">
          {error ? (
            <p className="text-xs text-red-500 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <span
              className={`text-xs tabular-nums ${
                charCount >= maxLength
                  ? 'text-red-500'
                  : charCount >= maxLength * 0.9
                  ? 'text-amber-500'
                  : 'text-[#a3a3a3]'
              }`}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
