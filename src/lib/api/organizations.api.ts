import { client, unwrap } from "./client";

export interface OrgMembership {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  role: "OWNER" | "ADMIN" | "HOST";
  memberCount: number;
  isActive: boolean;
}

export interface OrgMember {
  id: string;
  role: "OWNER" | "ADMIN" | "HOST";
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export const organizationsApi = {
  listMine: async () => {
    const res = await client.get<{ data: OrgMembership[] }>(
      "/organizations/mine",
    );
    return unwrap(res);
  },

  switchActive: async (organizationId: string) => {
    const res = await client.post<{
      data: { id: string; activeOrganizationId: string };
    }>(`/organizations/${organizationId}/switch`);
    return unwrap(res);
  },

  listMembers: async (organizationId: string) => {
    const res = await client.get<{ data: OrgMember[] }>(
      `/organizations/${organizationId}/members`,
    );
    return unwrap(res);
  },

  removeMember: async (organizationId: string, userId: string) => {
    const res = await client.delete<{ data: { message: string } }>(
      `/organizations/${organizationId}/members/${userId}`,
    );
    return unwrap(res);
  },

  rename: async (organizationId: string, name: string) => {
    const res = await client.patch<{ data: { id: string; name: string } }>(
      `/organizations/${organizationId}`,
      { name },
    );
    return unwrap(res);
  },

  updateMemberRole: async (
    organizationId: string,
    userId: string,
    role: "HOST" | "ADMIN",
  ) => {
    const res = await client.patch<{ data: OrgMember }>(
      `/organizations/${organizationId}/members/${userId}/role`,
      { role },
    );
    return unwrap(res);
  },
};
