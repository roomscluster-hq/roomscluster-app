import { client, unwrap } from "./client";

export interface Invitation {
  id: string;
  email: string;
  role: "OWNER" | "HOST";
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
}

export interface InvitationDetails extends Invitation {
  organization: { name: string };
  invitedBy: { name: string | null; email: string };
}

export const invitationsApi = {
  invite: async (organizationId: string, email: string) => {
    const res = await client.post<{ data: Invitation }>("/invitations", {
      organizationId,
      email,
    });
    return unwrap(res);
  },

  listForOrganization: async (organizationId: string) => {
    const res = await client.get<{ data: Invitation[] }>(
      `/invitations/organization/${organizationId}`
    );
    return unwrap(res);
  },

  getByToken: async (token: string) => {
    const res = await client.get<{ data: InvitationDetails }>(`/invitations/token/${token}`);
    return unwrap(res);
  },

  accept: async (token: string) => {
    const res = await client.post<{ data: any }>(`/invitations/token/${token}/accept`);
    return unwrap(res);
  },

  revoke: async (invitationId: string) => {
    const res = await client.post<{ data: Invitation }>(`/invitations/${invitationId}/revoke`);
    return unwrap(res);
  },
};