"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Video, CheckCircle, RefreshCw, Edit3 } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { SessionStatus } from "@/types";
import { sessionsApi } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SeriesSession {
  id: string;
  title: string;
  status: SessionStatus;
  scheduledAt?: string | null;
  occurrenceIndex?: number | null;
  recurrenceRuleId?: string | null;
  _count?: {
    participants: number;
    registrations: number;
    recordings: number;
    attendance: number;
  };
}

interface RecurringSeriesGroupProps {
  recurrenceRuleId: string;
  sessions: SeriesSession[];
  onDeleteSession: (id: string, title: string) => void;
}

export function RecurringSeriesGroup({
  recurrenceRuleId,
  sessions,
  onDeleteSession,
}: RecurringSeriesGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  if (sessions.length === 0) return null;

  const title = sessions[0].title;
  const upcoming = sessions.filter((s) => s.status === "SCHEDULED");
  const live = sessions.filter((s) => s.status === "LIVE");
  const ended = sessions.filter((s) => s.status === "ENDED");

  // Next upcoming session
  const nextSession = live[0] ?? upcoming[0];
  const totalCount = sessions.length;
  const upcomingCount = upcoming.length + live.length;

  function handleCancelSeries() {
    toast(`Cancel all ${upcomingCount} upcoming sessions in this series?`, {
      action: {
        label: "Cancel Series",
        onClick: async () => {
          try {
            const result = await sessionsApi.cancelSeries(recurrenceRuleId);
            toast.success(`${result.cancelled} sessions cancelled`);
            queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
          } catch {
            toast.error("Failed to cancel series");
          }
        },
      },
      cancel: { label: "Keep", onClick: () => {} },
      duration: 8000,
    });
  }

  // Sort: live first, then upcoming, then ended (dimmed)
  const sortedSessions = [...live, ...upcoming, ...ended];

  return (
    <div className="border border-surface-200 rounded-card overflow-hidden bg-surface-0">
      {/* Series header — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-surface-50 transition-colors select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-ink-700/40 shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>

        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <RefreshCw size={14} className="text-primary-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink-900 truncate">{title}</p>
            <span className="shrink-0 text-xs bg-primary-50 text-primary-700 border border-primary-100 px-1.5 py-0.5 rounded-full font-medium">
              {totalCount} sessions
            </span>
            {live.length > 0 && (
              <span className="shrink-0 text-xs bg-success-50 text-success-700 px-1.5 py-0.5 rounded-full font-medium">
                LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-ink-700/50 mt-0.5">
            {nextSession
              ? `Next: ${formatDateTime(nextSession.scheduledAt!)}`
              : `${ended.length} session${ended.length !== 1 ? "s" : ""} ended`}
            {upcomingCount > 0 && ` · ${upcomingCount} upcoming`}
          </p>
        </div>

        {/* Series actions */}
        <div className="flex items-center gap-2 shrink-0">
          {upcomingCount > 0 && (
            <>
              <Link
                href={`/dashboard/sessions/series/${recurrenceRuleId}/edit`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50 transition-colors flex items-center gap-1"
              >
                <Edit3 size={12} />
                Edit series
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelSeries();
                }}
                className="text-xs text-danger-600 hover:text-danger-700 px-2 py-1 rounded hover:bg-danger-50 transition-colors"
              >
                Cancel series
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded list of occurrences */}
      {expanded && (
        <div className="border-t border-surface-200 divide-y divide-surface-100">
          {sortedSessions.map((session) => {
            const isEnded = session.status === "ENDED";
            return (
              <div
                key={session.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  isEnded ? "opacity-50" : "hover:bg-surface-50"
                } transition-colors`}
              >
                <div className="w-6 shrink-0 text-center">
                  <span className="text-xs text-ink-700/40 font-mono">
                    #{session.occurrenceIndex}
                  </span>
                </div>

                <Video size={14} className="text-primary-600 shrink-0" />

                <Link
                  href={`/dashboard/sessions/${session.id}`}
                  className="flex-1 min-w-0 flex items-center gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink-900 truncate">
                      {session.scheduledAt
                        ? formatDateTime(session.scheduledAt)
                        : "Instant session"}
                    </p>
                    {(session._count?.attendance ?? 0) > 0 && (
                      <p className="text-xs text-ink-700/50">
                        {session._count?.attendance} attendees
                      </p>
                    )}
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={session.status} />
                  {(session._count?.recordings ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-success-600">
                      <CheckCircle size={10} />
                      Rec
                    </span>
                  )}
                  {!isEnded && (
                    <button
                      onClick={() => onDeleteSession(session.id, session.title)}
                      className="text-xs text-danger-500 hover:text-danger-700 transition-colors px-1"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}