"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { SessionStatus } from "@/types";

interface SessionHeaderProps {
  title: string;
  description?: string;
  status: SessionStatus;
}

export function SessionHeader({ title, description, status }: SessionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
      <div className="min-w-0">
        <Link
          href="/dashboard/sessions"
          className="text-sm text-ink-700/40 hover:text-ink-700 mb-2 inline-block"
        >
          ← Back to Sessions
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-ink-900 wrap-break-words">{title}</h1>
        {description && (
          <p className="text-ink-700/60 text-sm mt-1">{description}</p>
        )}
      </div>
      <div className="shrink-0">
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
