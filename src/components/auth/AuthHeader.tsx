"use client";

import Image from "next/image";
import { Logo } from "../Logo";

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export function AuthHeader({
  title,
  subtitle,
  showLogo = true,
}: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-8">
      {showLogo && (
        <Logo
          fallbackSrc="/favicon.png"
          width={64}
          height={64}
          className="mb-4"
          priority
        />
      )}
      {title && <h1 className="text-2xl font-bold text-ink-900">{title}</h1>}
      {subtitle && <p className="text-ink-700/60 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
