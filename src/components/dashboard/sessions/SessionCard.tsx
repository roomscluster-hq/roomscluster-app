"use client";

import Link from "next/link";
import { Video, GripVertical, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { SessionStatus } from "@/types";

const SESSION_CARD_STYLES: Record<SessionStatus, string> = {
  LIVE: "bg-linear-to-br from-success-600 to-ink-900",
  SCHEDULED: "bg-linear-to-br from-primary-600 to-ink-900",
  ENDED: "bg-linear-to-br from-ink-700 to-ink-900",
};

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    status: SessionStatus;
    scheduledAt?: string;
    _count?: {
      participants: number;
      recordings: number;
    };
  };
  onDragStart: () => void;
  onMoveToRoot: () => void;
  onDelete: () => void;
}

export function SessionCard({ session, onDragStart, onMoveToRoot, onDelete }: SessionCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group relative border border-surface-200 rounded-card overflow-hidden bg-surface-0 hover:shadow-raised transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className={`relative h-24 flex items-center justify-center ${SESSION_CARD_STYLES[session.status]}`}>
        <Video size={32} className="text-white/30" />
        <div className="absolute top-2.5 left-2.5">
          <StatusBadge status={session.status} className="bg-white/90" />
        </div>
        <div className="absolute bottom-2.5 left-2.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} />
        </div>
      </div>

      {/* Menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Show menu
          }}
          className="p-1 hover:bg-surface-100 rounded bg-white/90"
        >
          <span className="sr-only">Menu</span>
          <svg className="w-4 h-4 text-ink-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <Link href={`/dashboard/sessions/${session.id}`} className="block p-4">
        <p className="text-sm font-medium text-ink-900 truncate pr-6">
          {session.title}
        </p>
        <div className="flex items-center gap-3 text-xs text-ink-700/50 mt-1.5">
          <span>
            {session.scheduledAt ? formatDateTime(session.scheduledAt) : "Instant session"}
          </span>
          {(session._count?.participants ?? 0) > 0 && (
            <span>{session._count.participants} participants</span>
          )}
        </div>
        {(session._count?.recordings ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs text-success-600 bg-success-50 px-2 py-0.5 rounded">
            <CheckCircle size={12} />
            Recorded
          </span>
        )}
      </Link>
    </div>
  );
}
