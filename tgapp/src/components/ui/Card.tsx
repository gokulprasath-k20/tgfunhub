'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={`card ${paddingMap[padding]} ${
        hover
          ? 'transition-shadow duration-200 hover:shadow-[0_4px_12px_0_rgb(0,0,0,0.1)] cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
