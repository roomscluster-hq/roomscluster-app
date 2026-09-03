import { client, unwrap } from "./client";

export interface HistoricalPollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface HistoricalPoll {
  id: string;
  question: string;
  type: "SINGLE" | "MULTIPLE";
  status: string;
  totalVoters: number;
  createdAt: string;
  options: HistoricalPollOption[];
}

export const pollApi = {
  getHistory: async (sessionId: string) => {
    const res = await client.get<{ data: HistoricalPoll[] }>(
      `/polls/session/${sessionId}/history`,
    );
    return unwrap(res);
  },
};