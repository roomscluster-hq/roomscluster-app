"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-0 sm:bg-surface-50 flex items-center justify-center sm:p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="hidden sm:block absolute -top-24 -right-24 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-24 -left-24 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md p-6 sm:p-0">
        {children}
      </div>
    </div>
  );
}
