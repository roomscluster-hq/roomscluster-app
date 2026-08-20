import { client, unwrap } from "./client";

export interface PortalSession {
  id: string;
  title: string;
  description: string | null;
  status: "LIVE" | "SCHEDULED" | "ENDED";
  joinCode: string;
  scheduledAt: string | null;
  endedAt: string | null;
  hostName: string;
  group: { id: string; name: string; labelOverride: string | null; membersCanViewRecordings: boolean };
  recordingCount: number;
}

export const portalApi = {
  getMyDashboard: async () => {
    const res = await client.get<{ data: { sessions: PortalSession[] } }>(
      "/portal/dashboard",
    );
    return unwrap(res);
  },
};