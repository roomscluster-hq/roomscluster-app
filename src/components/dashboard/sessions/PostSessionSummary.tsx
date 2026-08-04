"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  Video,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

interface PostSessionSummaryProps {
  session: {
    title: string;
    startedAt: string | null;
    endedAt: string | null;
    scheduledAt: string | null;
  };
  totalAttendees: number;
  guestCount: number;
  authenticatedCount: number;
  recordingsCount: number;
  hasRecordings: boolean;
  formatDateTime: (date: string) => string;
  onDownloadAttendanceCsv: () => void;
  onDownloadTranscriptTxt: () => void;
}

function formatDuration(startedAt: string | null, endedAt: string | null): string {
  if (!startedAt || !endedAt) return "—";
  const diffMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

export function PostSessionSummary({
  session,
  totalAttendees,
  guestCount,
  authenticatedCount,
  recordingsCount,
  hasRecordings,
  formatDateTime,
  onDownloadAttendanceCsv,
  onDownloadTranscriptTxt,
}: PostSessionSummaryProps) {
  const duration = formatDuration(session.startedAt, session.endedAt);

  const stats = [
    {
      icon: <Users className="w-5 h-5 text-primary-600" />,
      label: "Total Attendees",
      value: totalAttendees,
      sub: `${authenticatedCount} registered · ${guestCount} guests`,
      bg: "bg-primary-50",
    },
    {
      icon: <Clock className="w-5 h-5 text-success-600" />,
      label: "Duration",
      value: duration,
      sub: session.startedAt ? `Started ${formatDateTime(session.startedAt)}` : "—",
      bg: "bg-success-50",
    },
    {
      icon: <Video className="w-5 h-5 text-warning-600" />,
      label: "Recordings",
      value: recordingsCount,
      sub: recordingsCount > 0 ? "Available to download" : "No recordings",
      bg: "bg-warning-50",
    },
  ];

  return (
    <Card className="mb-6 border-success-200 bg-success-50/30">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <h2 className="font-semibold text-ink-900">Session Complete</h2>
            <p className="text-xs text-ink-700/60">
              {session.endedAt
                ? `Ended ${formatDateTime(session.endedAt)}`
                : "Session has ended"}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl p-4 flex items-start gap-3`}
            >
              <div className="shrink-0 mt-0.5">{stat.icon}</div>
              <div className="min-w-0">
                <p className="text-xs text-ink-700/60 mb-0.5">{stat.label}</p>
                <p className="text-xl font-bold text-ink-900 truncate">{stat.value}</p>
                <p className="text-xs text-ink-700/50 mt-0.5 truncate">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick downloads */}
        <div className="border-t border-surface-200 pt-4">
          <p className="text-xs font-medium text-ink-700/60 uppercase tracking-wider mb-3">
            Quick Downloads
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onDownloadAttendanceCsv}
              className="gap-2"
            >
              <Users className="w-3.5 h-3.5" />
              Attendance Report
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onDownloadTranscriptTxt}
              className="gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat Transcript
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
