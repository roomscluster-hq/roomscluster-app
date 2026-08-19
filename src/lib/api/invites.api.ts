import { client, unwrap } from "./client";

export interface ResolvedInvite {
  sessionId: string;
  joinCode: string;
  sessionTitle: string;
  memberEmail: string;
  sessionStatus: "SCHEDULED" | "LIVE" | "ENDED";
  requiresPasscode: boolean;
}

export const invitesApi = {
  resolve: async (token: string): Promise<ResolvedInvite> => {
    const res = await client.get<{ data: ResolvedInvite }>(`/invites/${token}`);
    return unwrap(res);
  },

  resend: async (joinCode: string, email: string) => {
    const res = await client.post(`/invites/resend`, { joinCode, email });
    return unwrap(res);
  },
};