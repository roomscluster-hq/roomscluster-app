import { client, unwrap } from "./client";

export interface SessionSettings {
  id: string;
  sessionId: string;
  waitingRoomEnabled: boolean;
  chatEnabled: boolean;
  participantVideoEnabled: boolean;
  participantMicEnabled: boolean;
  recordingEnabled: boolean;
}

export const sessionSettingsApi = {
  get: async (sessionId: string) => {
    const res = await client.get<{ data: SessionSettings }>(
      `/sessions/${sessionId}/settings`
    );
    return unwrap(res);
  },

  update: async (sessionId: string, data: Partial<Omit<SessionSettings, "id" | "sessionId">>) => {
    const res = await client.patch<{ data: SessionSettings }>(
      `/sessions/${sessionId}/settings`,
      data
    );
    return unwrap(res);
  },
};