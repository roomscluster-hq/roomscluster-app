import { client, unwrap } from "./client";

export const transcriptApi = {
  generate: async (recordingId: string) => {
    const res = await client.post<{ data: { transcript: string; status: string } }>(
      `/transcripts/${recordingId}/generate`
    );
    return unwrap(res);
  },

  get: async (recordingId: string) => {
    const res = await client.get<{ data: { transcript: string | null; hasTranscript: boolean } }>(
      `/transcripts/${recordingId}`
    );
    return unwrap(res);
  },
};
