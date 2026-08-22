"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { PortalSessionCard } from "./PortalSessionCard";
import { portalApi, type PortalGroup, type PortalSession } from "@/lib/api/portal.api";

export function PortalGroupSection({ data }: { data: PortalGroup }) {
  const { group, liveAndScheduled, endedPagination } = data;
  const [expanded, setExpanded] = useState(true);
  const [endedSessions, setEndedSessions] = useState<PortalSession[]>(data.endedSessions);
  const [pagination, setPagination] = useState(endedPagination);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadMore() {
    if (pagination.nextSkip == null) return;
    setLoadingMore(true);
    try {
      const result = await portalApi.getGroupPastSessions(group.id, pagination.nextSkip, pagination.take);
      setEndedSessions((prev) => [...prev, ...result.sessions]);
      setPagination(result.pagination);
    } finally {
      setLoadingMore(false);
    }
  }

  const totalCount = liveAndScheduled.length + pagination.total;
  console.log("ll", data)

  return (
    <div className="border border-surface-200 rounded-xl bg-surface-0 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Layers size={16} />
          </div>
          <div className="text-left">
            <p className="font-medium text-ink-900">{group.name}</p>
            <p className="text-xs text-ink-700/50">
              {totalCount} session{totalCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-ink-700/40 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {liveAndScheduled.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveAndScheduled.map((s) => (
                <PortalSessionCard key={s.id} session={s} />
              ))}
            </div>
          )}

          {endedSessions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-ink-700/50 uppercase tracking-wide mb-2">
                Past sessions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {endedSessions.map((s) => (
                  <PortalSessionCard key={s.id} session={s} />
                ))}
              </div>
              {pagination.hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              )}
            </div>
          )}

          {liveAndScheduled.length === 0 && endedSessions.length === 0 && (
            <p className="text-sm text-ink-700/50 py-4 text-center">
              No sessions yet in this group.
            </p>
          )}
        </div>
      )}
    </div>
  );
}