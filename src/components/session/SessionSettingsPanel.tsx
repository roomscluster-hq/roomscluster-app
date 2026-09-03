"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sessionSettingsApi,
  SessionSettings,
} from "@/lib/api/session-settings.api";
import { useRoom } from "@/contexts/RoomContext";
import { toast } from "sonner";
import { Socket } from "socket.io-client";
import { useActiveOrganization } from "@/hooks/useOrganizationsMine";
import { useUpgradePromptStore } from "@/store/upgrade-prompt.store";

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  dark?: boolean;
  locked?: boolean;
  onUpgradeClick?: () => void;
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  dark,
  locked,
  onUpgradeClick,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-medium ${dark ? "text-white" : "text-ink-900"}`}
          >
            {label}
          </p>
          {locked && (
            <button
              onClick={onUpgradeClick}
              className="text-[10px] font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary-100"
            >
              Upgrade
            </button>
          )}
        </div>
        <p
          className={`text-xs mt-0.5 ${dark ? "text-white/50" : "text-ink-700/60"}`}
        >
          {description}
        </p>
      </div>
      <button
        type="button"
        disabled={disabled || locked}
        onClick={locked ? onUpgradeClick : onChange}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
          checked ? "bg-primary-600" : dark ? "bg-white/10" : "bg-surface-200"
        } ${dark ? "focus:ring-offset-ink-900" : ""} ${disabled || locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

interface SessionSettingsPanelProps {
  sessionId: string;
  joinCode?: string;
  compact?: boolean;
}

function updateSettingsViaSocket(
  socket: Socket,
  joinCode: string,
  settings: Partial<Omit<SessionSettings, "id" | "sessionId">>,
): Promise<SessionSettings> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      socket.off("settings:updated", handleSuccess);
      socket.off("error", handleError);
      reject(new Error("Settings update timeout"));
    }, 10000);

    const handleSuccess = (updated: SessionSettings) => {
      clearTimeout(timeoutId);
      socket.off("settings:updated", handleSuccess);
      socket.off("error", handleError);
      resolve(updated);
    };

    const handleError = (error: { message?: string }) => {
      clearTimeout(timeoutId);
      socket.off("settings:updated", handleSuccess);
      socket.off("error", handleError);
      reject(new Error(error.message || "Failed to update settings"));
    };

    socket.once("settings:updated", handleSuccess);
    socket.once("error", handleError);
    socket.emit("settings:update", { joinCode, settings });
  });
}

export function SessionSettingsPanel({
  sessionId,
  joinCode,
  compact = false,
}: SessionSettingsPanelProps) {
  const queryClient = useQueryClient();

  const { activeOrg } = useActiveOrganization();
  const showUpgrade = useUpgradePromptStore((s) => s.show);

  function handleUpgradeClick() {
    showUpgrade(
      "Enabling participant video or microphone requires the Pro plan.",
      "PRO",
    );
  }

  // These are only available inside RoomProvider (live room)
  // Outside the room (session detail page), useRoom() throws — guard with try/catch
  let socketRef: React.RefObject<Socket | null> | null = null;
  let isSocketConnected = false;
  let isLocked = false;
  let toggleLock: (() => void) | null = null;

  try {
    const room = useRoom();
    socketRef = room.socketRef;
    isSocketConnected = room.isSocketConnected;
    isLocked = room.isLocked;
    toggleLock = room.toggleLock;
  } catch {
    // Not inside RoomProvider — session detail page usage
  }

  const { data: settings, isLoading } = useQuery({
    queryKey: ["session-settings", sessionId],
    queryFn: () => sessionSettingsApi.get(sessionId),
  });

  const shouldUseSocket = Boolean(
    joinCode && socketRef?.current && isSocketConnected,
  );

  const updateMutation = useMutation({
    mutationFn: async (
      data: Partial<Omit<SessionSettings, "id" | "sessionId">>,
    ) => {
      if (shouldUseSocket && socketRef?.current) {
        return updateSettingsViaSocket(socketRef.current, joinCode!, data);
      } else {
        return sessionSettingsApi.update(sessionId, data);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["session-settings", sessionId], updated);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update settings",
      );
    },
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
    <div
      className={
        compact ? "divide-y divide-white/10" : "divide-y divide-surface-200"
      }
    >
      {/* ── Lock session toggle — only shown inside live room ── */}
      {toggleLock && (
        <ToggleRow
          label="Lock Session"
          description="Prevent new participants from joining"
          checked={isLocked}
          onChange={toggleLock}
          dark={compact}
        />
      )}

      {/* ── Standard settings rows ── */}
      {rows.map((row) => {
        const isAdvanced =
          row.key === "participantVideoEnabled" ||
          row.key === "participantMicEnabled";
        const locked = isAdvanced && !activeOrg?.advancedSessionSettingsEnabled;
        return (
          <ToggleRow
            key={row.key}
            label={row.label}
            description={row.description}
            checked={locked ? false : settings[row.key]}
            onChange={() => toggle(row.key)}
            disabled={updateMutation.isPending}
            dark={compact}
            locked={locked}
            onUpgradeClick={handleUpgradeClick}
          />
        );
      })}
    </div>
  );
}
