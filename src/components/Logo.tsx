"use client";

import Image from "next/image";
import { useSubdomain } from "@/contexts/SubdomainContext";

interface LogoProps {
  fallbackSrc: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function Logo({ fallbackSrc, width, height, className, priority }: LogoProps) {
  const { org } = useSubdomain();
  const src = org?.logoUrl || fallbackSrc;

  return (
    <Image
      src={src}
      alt={org?.name ?? "RoomsCluster"}
      width={width}
      height={height}
      className={className}
      priority={priority}
      // A custom logoUrl can be hosted on any arbitrary domain the org
      // pastes in — Next's built-in image optimizer only works with
      // domains explicitly allowlisted in next.config.js, which we can't
      // predict ahead of time. Bypass optimization only for these.
      unoptimized={!!org?.logoUrl}
    />
  );
}