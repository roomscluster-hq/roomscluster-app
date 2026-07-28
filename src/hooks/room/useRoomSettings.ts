"use client";

import { useState, useEffect } from "react";
import { RoomSettings } from "@/lib/room/types";

interface UseRoomSettingsReturn extends Required<RoomSettings> {
  updateSettings: (settings: RoomSettings) => void;
}

export function useRoomSettings(sessionId: string): UseRoomSettingsReturn {
  const [settings, setSettings] = useState<Required<RoomSettings>>({
    chatEnabled: true,
    participantVideoEnabled: true,
    participantMicEnabled: true,
  });

  // Load initial session settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
        const res = await fetch(`${API_URL}/sessions/${sessionId}/settings`);
        if (res.ok) {
          const json = await res.json();
          const s = json.data ?? json;
          setSettings({
            chatEnabled: s.chatEnabled ?? true,
            participantVideoEnabled: s.participantVideoEnabled ?? true,
            participantMicEnabled: s.participantMicEnabled ?? true,
          });
        }
      } catch {
        // fail silently — defaults to enabled
      }
    }

    loadSettings();
  }, [sessionId]);

  const updateSettings = (newSettings: RoomSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    ...settings,
    updateSettings,
  };
}
