"use client";

import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <div className={`bg-surface-0 sm:rounded-2xl sm:shadow-raised sm:border sm:border-surface-200 p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}
