import React from 'react';

export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-800/80 ${className}`}
      {...props}
    />
  );
}
