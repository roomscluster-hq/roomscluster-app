"use client";

import { useState } from "react";
import Link from "next/link";
import { Video, CheckCircle, ChevronDown, Music, Download, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { portalApi, type PortalSession, type PortalRecording } from "@/lib/api/portal.api";

const SESSION_CARD_STYLES: Record<string, string> = {
  LIVE: "bg-linear-to-br from-success-600 to-ink-900",
  SCHEDULED: "bg-linear-to-br from-primary-600 to-ink-900",
  ENDED: "bg-linear-to-br from-ink-700 to-ink-900",
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PortalSessionCard({ session }: { session: PortalSession }) {
  const isLive = session.status === "LIVE";
  const [recordingsOpen, setRecordingsOpen] = useState(false);
  const [recordings, setRecordings] = useState<PortalRecording[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function toggleRecordings() {
    const next = !recordingsOpen;
    setRecordingsOpen(next);

    if (next && recordings === null) {
      setLoadingList(true);
      try {
        const list = await portalApi.listSessionRecordings(session.id);
        setRecordings(list);
      } catch {
        setRecordings([]);
      } finally {
        setLoadingList(false);
      }
    }
  }

  async function handleDownload(recordingId: string) {
    setDownloadingId(recordingId);
    try {
      const { url } = await portalApi.getRecordingDownloadUrl(recordingId);
      window.open(url, "_blank");
    } finally {
      setDownloadingId(null);
    }
  }

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

        {isLive && (
          <Link
            href={`/room/${session.joinCode}`}
            className="block mt-3 w-full text-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Join Session
          </Link>
        )}

        {session.recordingCount > 0 && (
          <div className="mt-3 border-t border-surface-200 pt-3">
            <button
              onClick={toggleRecordings}
              className="w-full flex items-center justify-between text-xs text-success-600 hover:text-success-700 cursor-pointer"
            >
              <span className="flex items-center gap-1">
                <CheckCircle size={12} />
                {session.recordingCount} recording{session.recordingCount !== 1 ? "s" : ""} available
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${recordingsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {recordingsOpen && (
              <div className="mt-2 space-y-1.5">
                {loadingList ? (
                  <p className="text-xs text-ink-700/40 py-1">Loading...</p>
                ) : (
                  recordings?.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 bg-surface-50 rounded-lg px-2.5 py-1.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {r.type === "AUDIO" ? (
                          <Music size={14} className="text-ink-700/50 shrink-0" />
                        ) : (
                          <Video size={14} className="text-ink-700/50 shrink-0" />
                        )}
                        <span className="text-xs text-ink-700 truncate">
                          {r.type === "AUDIO" ? "Audio" : "Video"}
                          {r.duration ? ` · ${formatDuration(r.duration)}` : ""}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(r.id)}
                        disabled={downloadingId === r.id}
                        className="text-primary-600 hover:text-primary-700 shrink-0 cursor-pointer disabled:opacity-50"
                        title="Download"
                      >
                        {downloadingId === r.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}