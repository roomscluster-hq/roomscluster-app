"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { sessionsApi } from "@/lib/api";
import { recordingApi } from "@/lib/api/recording.api";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime, getJoinUrl } from "@/lib/utils";
import { toast } from "sonner";
import { SessionSettingsPanel } from "@/components/session/SessionSettingsPanel";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionsApi.getOne(id),
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["session-attendance", id],
    queryFn: () => sessionsApi.getAttendance(id),
    enabled: !!session, // only fetch once session loads
  });

  const { data: recordings, isLoading: recordingsLoading } = useQuery({
    queryKey: ["session-recordings", id],
    queryFn: () => recordingApi.list(id),
    enabled: !!session,
  });

  const startMutation = useMutation({
    mutationFn: () => sessionsApi.start(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session started");
      router.push(`/room/${data.joinCode}`);
    },
    onError: () => toast.error("Failed to start session"),
  });

  const endMutation = useMutation({
    mutationFn: () => sessionsApi.end(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session ended");
    },
    onError: () => toast.error("Failed to end session"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => sessionsApi.delete(id),
    onMutate: () => {
      toast("Deleting session permanently...", { id: "delete-session" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.dismiss("delete-session");
      toast.success("Session deleted");
      router.push("/dashboard/sessions");
    },
    onError: (err: any) => {
      toast.dismiss("delete-session");
      toast.error(err.message ?? "Failed to delete session");
    },
  });

  function confirmDelete() {
    toast("Delete this session permanently?", {
      action: {
        label: "Delete",
        onClick: () => deleteMutation.mutate(),
      },
      cancel: {
        label: "Cancel",
        onClick: () => { },
      },
      duration: 8000,
    });
  }

  async function handleDownloadRecording(recordingId: string) {
    try {
      const { url } = await recordingApi.getDownloadUrl(recordingId);
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Failed to generate download link");
    }
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function formatFileSize(bytes: number | null) {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  }

  function triggerDownload(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Escape a value for safe CSV embedding (handles commas, quotes, newlines)
  function csvEscape(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  function safeFilename(base: string) {
    return base.replace(/[^a-z0-9]/gi, "_");
  }

  async function handleDownloadTranscript(format: "txt" | "csv") {
    if (!session) return;
    try {
      const messages = await sessionsApi.getChatHistory(session.joinCode);

      if (messages.length === 0) {
        toast("No chat messages to download");
        return;
      }

      const base = safeFilename(session.title);

      if (format === "txt") {
        const lines = messages.map(
          (m) =>
            `[${formatDateTime(m.createdAt)}] ${m.senderName} (${m.senderEmail}): ${m.content}`
        );
        triggerDownload(lines.join("\n"), `${base}_transcript.txt`, "text/plain");
      } else {
        const header = "Timestamp,Sender Name,Sender Email,Message";
        const rows = messages.map((m) =>
          [
            csvEscape(formatDateTime(m.createdAt)),
            csvEscape(m.senderName),
            csvEscape(m.senderEmail),
            csvEscape(m.content),
          ].join(",")
        );
        triggerDownload([header, ...rows].join("\n"), `${base}_transcript.csv`, "text/csv");
      }

      toast.success(`Transcript downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error("Failed to download transcript");
    }
  }

  function handleDownloadAttendance(format: "csv" | "txt") {
    if (!session || !attendance || attendance.length === 0) {
      toast("No attendance data to download");
      return;
    }

    const base = safeFilename(session.title);

    if (format === "csv") {
      const header = "Name,Email,Role,Joined,Left";
      const rows = attendance.map((a) =>
        [
          csvEscape(a.name),
          csvEscape(a.email),
          csvEscape(a.role),
          csvEscape(formatDateTime(a.joinedAt)),
          csvEscape(a.leftAt ? formatDateTime(a.leftAt) : ""),
        ].join(",")
      );
      triggerDownload([header, ...rows].join("\n"), `${base}_attendance.csv`, "text/csv");
    } else {
      const lines = attendance.map(
        (a) =>
          `${a.name} (${a.email}) — ${a.role} — Joined: ${formatDateTime(a.joinedAt)}${a.leftAt ? `, Left: ${formatDateTime(a.leftAt)}` : ""
          }`
      );
      triggerDownload(lines.join("\n"), `${base}_attendance.txt`, "text/plain");
    }

    toast.success(`Attendance downloaded as ${format.toUpperCase()}`);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!session) return null;

  const joinUrl = getJoinUrl(session.joinCode);

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
        <div className="min-w-0">
          <Link
            href="/dashboard/sessions"
            className="text-sm text-ink-700/40 hover:text-ink-700 mb-2 inline-block"
          >
            ← Back to Sessions
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-ink-900 wrap-break-words">{session.title}</h1>
          {session.description && (
            <p className="text-ink-700/60 text-sm mt-1">{session.description}</p>
          )}
        </div>
        <div className="shrink-0">
          <StatusBadge status={session.status} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Participants", value: session._count?.participants ?? 0 },
          { label: "Registrations", value: session._count?.registrations ?? 0 },
          {
            label: "Scheduled",
            value: session.scheduledAt
              ? formatDateTime(session.scheduledAt)
              : "Instant",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <p className="text-xs text-ink-700/60 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-ink-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Join Link */}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-semibold text-ink-900">Session Join Link</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-sm text-ink-700 truncate">
              {joinUrl}
            </code>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(joinUrl);
                toast.success("Link copied to clipboard");
              }}
            >
              Copy
            </Button>
          </div>
          <p className="text-xs text-ink-700/40 mt-2">
            Share this link with your attendees
          </p>
        </CardContent>
      </Card>

      {/* Session Settings */}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-semibold text-ink-900">Meeting Settings</h2>
        </CardHeader>
        <CardContent>
          <SessionSettingsPanel sessionId={id} />
        </CardContent>
      </Card>

      {/* Recordings */}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-semibold text-ink-900">
            Recordings ({recordings?.length ?? 0})
          </h2>
        </CardHeader>
        <CardContent>
          {recordingsLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : !recordings || recordings.length === 0 ? (
            <div className="bg-surface-50 border border-surface-200 rounded-lg px-4 py-6 text-center">
              <p className="text-sm text-ink-700/60">
                🎥 No recordings yet for this session.
              </p>
              <p className="text-xs text-ink-700/40 mt-1">
                Start a recording from the room's control bar while live.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-surface-200">
              {recordings.map((rec) => {
                // Extract a clean display name from the stored filename —
                // strip the path and extension, leaving just the
                // session-title-based name (e.g. "Football_2026-06-27T19-54-17")
                const baseName = rec.filename
                  .split("/")
                  .pop()
                  ?.replace(/\.mp4$/, "") ?? rec.filename;

                return (
                  <div key={rec.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">🎥</span>
                      <div className="min-w-0">
                        <p className="text-sm text-ink-900 truncate">{baseName}</p>
                        <p className="text-xs text-ink-700/40">
                          {formatDateTime(rec.createdAt)} · {formatDuration(rec.duration)} ·{" "}
                          {formatFileSize(rec.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadRecording(rec.id)}
                      className="shrink-0"
                    >
                      Download
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Transcript */}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-semibold text-ink-900">Chat Transcript</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-700/60">
              Download the full chat log from this session.
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadTranscript("txt")}
              >
                Download .txt
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadTranscript("csv")}
              >
                Download .csv
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-ink-900">
              Attendance ({attendance?.length ?? 0})
            </h2>
            {attendance && attendance.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadAttendance("csv")}
                >
                  Download .csv
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadAttendance("txt")}
                >
                  Download .txt
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {attendanceLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : !attendance || attendance.length === 0 ? (
            <p className="text-sm text-ink-700/40 text-center py-6">
              No one has joined this session yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-700/60 border-b border-surface-200">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Joined</th>
                    <th className="py-2 font-medium">Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {attendance.map((a, i) => (
                    <tr key={`${a.email}-${i}`}>
                      <td className="py-2.5 pr-4 text-ink-900">{a.name}</td>
                      <td className="py-2.5 pr-4 text-ink-700/60">{a.email}</td>
                      <td className="py-2.5 pr-4 text-ink-700/60">
                        {formatDateTime(a.joinedAt)}
                      </td>
                      <td className="py-2.5 text-ink-700/60">
                        {a.leftAt ? formatDateTime(a.leftAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-ink-900">Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {session.status === "SCHEDULED" && (
              <Button
                onClick={() => startMutation.mutate()}
                loading={startMutation.isPending}
              >
                Start Session
              </Button>
            )}

            {session.status === "LIVE" && (
              <>
                <Link href={`/room/${session.joinCode}`}>
                  <Button>Rejoin Session</Button>
                </Link>
                <Button
                  variant="danger"
                  onClick={() => endMutation.mutate()}
                  loading={endMutation.isPending}
                >
                  End Session
                </Button>
              </>
            )}

            {session.status === "ENDED" && (
              <Button
                variant="danger"
                onClick={confirmDelete}
                loading={deleteMutation.isPending}
              >
                Delete Session
              </Button>
            )}

            <Link href="/dashboard/sessions">
              <Button variant="secondary">Back to Sessions</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
