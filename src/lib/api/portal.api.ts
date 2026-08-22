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
  group: {
    id: string;
    name: string;
    labelOverride: string | null;
    membersCanViewRecordings: boolean;
  };
  recordingCount: number;
}

export interface PortalGroup {
  group: {
    id: string;
    name: string;
    labelOverride: string | null;
    membersCanViewRecordings: boolean;
  };
  liveAndScheduled: PortalSession[];
  endedSessions: PortalSession[];
  endedPagination: {
    total: number;
    take: number;
    hasMore: boolean;
    nextSkip: number | null;
  };
}

export const portalApi = {
  getMyDashboard: async () => {
    const res = await client.get<{ data: { groups: PortalGroup[] } }>(
      "/portal/dashboard",
    );
    return unwrap(res);
  },

  getGroupPastSessions: async (groupId: string, skip = 0, take = 5) => {
    const res = await client.get<{
      data: {
        sessions: PortalSession[];
        pagination: {
          total: number;
          take: number;
          hasMore: boolean;
          nextSkip: number | null;
        };
      };
    }>(`/portal/groups/${groupId}/past-sessions`, { params: { skip, take } });
    return unwrap(res);
  },
};
