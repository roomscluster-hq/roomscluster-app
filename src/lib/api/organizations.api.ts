import { client, unwrap } from "./client";

export interface OrgMembership {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  logoUrl: string | null;
  primaryColor: string | null;
  fontFamily: string | null;
  subdomainEnabled: boolean;
  role: "OWNER" | "ADMIN" | "HOST" | "MEMBER";
  memberCount: number;
  isActive: boolean;
  plan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
  maxTeammates: number | null;
  advancedSessionSettingsEnabled: boolean;
  canRecordVideo: boolean;
  canRecordBothSimultaneously: boolean;
  maxSessionMinutes: number;
  maxCoHostsPerSession: number;
  customBrandingEntitled: boolean;
  groupsEnabled: boolean;
  qaPollsHistoryEnabled: boolean
}

export interface PublicOrgBranding {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  fontFamily: string | null;
  isPersonal: boolean;
}

export interface OrgMember {
  id: string;
  role: "OWNER" | "ADMIN" | "HOST" | "MEMBER";
  groupIds: string[];
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

  updateDetails: async (
    organizationId: string,
    data: {
      name?: string;
      logoUrl?: string;
      primaryColor?: string;
      fontFamily?: string;
    },
  ) => {
    const res = await client.patch<{ data: { id: string; name: string } }>(
      `/organizations/${organizationId}`,
      data,
    );
    return unwrap(res);
  },

  updateSlug: async (organizationId: string, slug: string) => {
    const res = await client.patch<{ data: { id: string; slug: string } }>(
      `/organizations/${organizationId}/slug`,
      { slug },
    );
    return unwrap(res);
  },

  getBySlug: async (slug: string) => {
    const res = await client.get<{ data: PublicOrgBranding }>(
      `/organizations/by-slug/${slug}`,
    );
    return unwrap(res);
  },

  uploadLogo: async (organizationId: string, file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    const res = await client.post<{ data: { logoUrl: string } }>(
      `/organizations/${organizationId}/logo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return unwrap(res);
  },
};
