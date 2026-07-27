"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionSettingsApi, SessionSettings } from "@/lib/api/session-settings.api";
import { useRoom } from "@/contexts/RoomContext";
import { toast } from "sonner";

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  dark?: boolean;
}

function ToggleRow({ label, description, checked, onChange, disabled, dark }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0 pr-4">
        <p className={`text-sm font-medium ${dark ? "text-white" : "text-ink-900"}`}>{label}</p>
        <p className={`text-xs mt-0.5 ${dark ? "text-white/50" : "text-ink-700/60"}`}>{description}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onChange}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
          checked ? "bg-primary-600" : dark ? "bg-white/10" : "bg-surface-200"
        } ${dark ? "focus:ring-offset-ink-900" : ""} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

interface SessionSettingsPanelProps {
  sessionId: string;
  joinCode?: string;  // when provided, broadcasts changes to the live room via socket
  compact?: boolean;
}

export function SessionSettingsPanel({ sessionId, joinCode, compact = false }: SessionSettingsPanelProps) {
  const queryClient = useQueryClient();

  // socketRef is only available inside RoomProvider — outside the room
  // (session detail page), useRoom() will throw, so we guard it.
  let socketRef: React.RefObject<any> | null = null;
  try {
    const room = useRoom();
    socketRef = room.socketRef;
  } catch {
    // Not inside RoomProvider — session detail page usage, no socket needed
  }

  const { data: settings, isLoading } = useQuery({
    queryKey: ["session-settings", sessionId],
    queryFn: () => sessionSettingsApi.get(sessionId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Omit<SessionSettings, "id" | "sessionId">>) =>
      sessionSettingsApi.update(sessionId, data),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["session-settings", sessionId], updated);
      // Broadcast to live room participants via socket if we're inside a room
      if (joinCode && socketRef?.current) {
        socketRef.current.emit("settings:update", { joinCode, settings: variables });
      }
    },
    onError: () => toast.error("Failed to update settings"),
  });

  function toggle(key: keyof Omit<SessionSettings, "id" | "sessionId">) {
    if (!settings) return;
    updateMutation.mutate({ [key]: !settings[key] });
  }

  if (isLoading || !settings) {
    return (
      <div className="py-4 text-center">
        <div
          className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto ${
            compact ? "border-white/60" : "border-primary-600"
          }`}
        />
      </div>
    );
  }

  const rows = [
    {
      key: "waitingRoomEnabled" as const,
      label: "Waiting Room",
      description: "Participants wait for host approval before entering",
    },
    {
      key: "chatEnabled" as const,
      label: "Public Chat",
      description: "Allow participants to send messages in the room",
    },
    {
      key: "participantVideoEnabled" as const,
      label: "Participant Video",
      description: "Allow participants to turn their cameras on",
    },
    {
      key: "participantMicEnabled" as const,
      label: "Participant Microphone",
      description: "Allow participants to unmute themselves",
    },
    {
      key: "recordingEnabled" as const,
      label: "Recording",
      description: "Allow the host to record this session",
    },
  ];

  return (
    <div className={compact ? "divide-y divide-white/10" : "divide-y divide-surface-200"}>
      {rows.map((row) => (
        <ToggleRow
          key={row.key}
          label={row.label}
          description={row.description}
          checked={settings[row.key]}
          onChange={() => toggle(row.key)}
          disabled={updateMutation.isPending}
          dark={compact}
        />
      ))}
    </div>
  );
}