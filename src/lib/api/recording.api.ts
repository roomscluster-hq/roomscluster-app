import { client, unwrap } from "./client";

export interface Recording {
  id: string;
  filename: string;
  s3Key: string;
  s3Url: string;
  duration: number | null;
  size: number | null;
  createdAt: string;
}

export const recordingApi = {
  start: async (sessionId: string) => {
    const res = await client.post<{ data: { egressId: string; status: string } }>(
      `/recordings/${sessionId}/start`
    );
    return unwrap(res);
  },

  stop: async (sessionId: string) => {
    const res = await client.post<{ data: { egressId: string; status: string } }>(
      `/recordings/${sessionId}/stop`
    );
    return unwrap(res);
  },

  getStatus: async (sessionId: string) => {
    const res = await client.get<{ data: { isRecording: boolean } }>(
      `/recordings/${sessionId}/status`
    );
    return unwrap(res);
  },

  list: async (sessionId: string) => {
    const res = await client.get<{ data: Recording[] }>(`/recordings/${sessionId}`);
    return unwrap(res);
  },

  getDownloadUrl: async (recordingId: string) => {
    const res = await client.get<{ data: { url: string; expiresIn: number; filename: string } }>(
      `/recordings/download/${recordingId}`
    );
    return unwrap(res);
  },
};