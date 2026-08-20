"use client";

import Link from "next/link";
import { Video, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { PortalSession } from "@/lib/api/portal.api";

const SESSION_CARD_STYLES: Record<string, string> = {
  LIVE: "bg-linear-to-br from-success-600 to-ink-900",
  SCHEDULED: "bg-linear-to-br from-primary-600 to-ink-900",
  ENDED: "bg-linear-to-br from-ink-700 to-ink-900",
};

export function PortalSessionCard({ session }: { session: PortalSession }) {
  const isLive = session.status === "LIVE";

  return (
    <div className="border border-surface-200 rounded-card overflow-hidden bg-surface-0 hover:shadow-raised transition-shadow">
      <div
        className={`relative h-24 flex items-center justify-center ${SESSION_CARD_STYLES[session.status]}`}
      >
        <Video size={32} className="text-white/30" />
        <div className="absolute top-2.5 left-2.5">
          <StatusBadge status={session.status} className="bg-white/90" />
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm font-medium text-ink-900 truncate">
          {session.title}
        </p>

        <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
          {session.group.labelOverride ?? "Group"}: {session.group.name}
        </span>

        <div className="flex items-center gap-3 text-xs text-ink-700/50 mt-2">
          <span>
            {session.scheduledAt
              ? formatDateTime(session.scheduledAt)
              : "Instant session"}
          </span>
          <span>Hosted by {session.hostName}</span>
        </div>

        {session.recordingCount > 0 && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs text-success-600 bg-success-50 px-2 py-0.5 rounded">
            <CheckCircle size={12} />
            Recording available
          </span>
        )}

        {isLive && (
          <Link
            href={`/room/${session.joinCode}`}
            className="block mt-3 w-full text-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Join Session
          </Link>
        )}
      </div>
    </div>
  );
}