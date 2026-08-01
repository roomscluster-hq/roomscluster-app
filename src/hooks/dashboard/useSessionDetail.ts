"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "@/lib/api";
import { recordingApi } from "@/lib/api/recording.api";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export function useSessionDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Queries
  const { data: session, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionsApi.getOne(id),
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["session-attendance", id],
    queryFn: () => sessionsApi.getAttendance(id),
    enabled: !!session,
  });

  const { data: recordings, isLoading: recordingsLoading } = useQuery({
    queryKey: ["session-recordings", id],
    queryFn: () => recordingApi.list(id),
    enabled: !!session,
  });

  const isCohost = session?.participants?.some(
    (p) => p.user?.id === user?.id && p.role === "COHOST",
  );
  const isHost = session?.hostId === user?.id;
  // Mutations
  const startMutation = useMutation({
    mutationFn: () => sessionsApi.start(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session started");
      window.open(`/room/${data.joinCode}`, "_blank");
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

  // Handlers
  const confirmDelete = () => {
    toast("Delete this session permanently?", {
      action: {
        label: "Delete",
        onClick: () => deleteMutation.mutate(),
      },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 8000,
    });
  };

  const handleDownloadRecording = async (recordingId: string) => {
    try {
      const { url } = await recordingApi.getDownloadUrl(recordingId);
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Failed to generate download link");
    }
  };

  // Download helpers
  const triggerDownload = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const csvEscape = (value: string): string => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const safeFilename = (base: string) => base.replace(/[^a-z0-9]/gi, "_");

  const handleDownloadTranscript = async (format: "txt" | "csv") => {
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
            `[${formatDateTime(m.createdAt)}] ${m.senderName} (${m.senderEmail}): ${m.content}`,
        );
        triggerDownload(
          lines.join("\n"),
          `${base}_transcript.txt`,
          "text/plain",
        );
      } else {
        const header = "Timestamp,Sender Name,Sender Email,Message";
        const rows = messages.map((m) =>
          [
            csvEscape(formatDateTime(m.createdAt)),
            csvEscape(m.senderName),
            csvEscape(m.senderEmail),
            csvEscape(m.content),
          ].join(","),
        );
        triggerDownload(
          [header, ...rows].join("\n"),
          `${base}_transcript.csv`,
          "text/csv",
        );
      }

      toast.success(`Transcript downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error("Failed to download transcript");
    }
  };

  const handleDownloadAttendance = (format: "csv" | "txt") => {
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
        ].join(","),
      );
      triggerDownload(
        [header, ...rows].join("\n"),
        `${base}_attendance.csv`,
        "text/csv",
      );
    } else {
      const lines = attendance.map(
        (a) =>
          `${a.name} (${a.email}) — ${a.role} — Joined: ${formatDateTime(a.joinedAt)}${
            a.leftAt ? `, Left: ${formatDateTime(a.leftAt)}` : ""
          }`,
      );
      triggerDownload(lines.join("\n"), `${base}_attendance.txt`, "text/plain");
    }

    toast.success(`Attendance downloaded as ${format.toUpperCase()}`);
  };

  // Format helpers
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  return {
    id,
    session,
    attendance,
    recordings,
    isLoading,
    attendanceLoading,
    recordingsLoading,
    isCohost,
    isHost,

    // Actions
    startSession: startMutation.mutate,
    endSession: endMutation.mutate,
    confirmDelete,
    handleDownloadRecording,
    handleDownloadTranscript,
    handleDownloadAttendance,

    // Format helpers
    formatDuration,
    formatFileSize,

    // Loading states
    isStarting: startMutation.isPending,
    isEnding: endMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
