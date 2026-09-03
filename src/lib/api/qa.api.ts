import { client, unwrap } from "./client";

export interface HistoricalQuestion {
  id: string;
  content: string;
  askerName: string;
  askerEmail: string;
  upvotes: number;
  downvotes: number;
  isAnswered: boolean;
  answer: string | null;
  createdAt: string;
}

export const qaApi = {
  getHistory: async (sessionId: string) => {
    const res = await client.get<{ data: HistoricalQuestion[] }>(
      `/qa/session/${sessionId}/history`,
    );
    return unwrap(res);
  },
};