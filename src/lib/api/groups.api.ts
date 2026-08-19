import { client, unwrap } from "./client";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  labelOverride: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { sessions: number; enrollments: number };
}

export interface PaginatedGroups {
  groups: Group[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const groupsApi = {
  list: async (organizationId: string, page = 1, pageSize = 25) => {
    const res = await client.get<{ data: PaginatedGroups }>(
      `/organizations/${organizationId}/groups`,
      { params: { page, pageSize } },
    );
    return unwrap(res);
  },

  bulkCreate: async (
    organizationId: string,
    groups: { name: string; description?: string }[],
  ) => {
    const res = await client.post<{ data: { created: number } }>(
      `/organizations/${organizationId}/groups/bulk`,
      { groups },
    );
    return unwrap(res);
  },

  bulkRemove: async (organizationId: string, groupIds: string[]) => {
    const res = await client.delete<{ data: { deleted: number } }>(
      `/organizations/${organizationId}/groups`,
      { data: { groupIds } },
    );
    return unwrap(res);
  },

  create: async (
    organizationId: string,
    data: { name: string; description?: string; labelOverride?: string },
  ) => {
    const res = await client.post<{ data: Group }>(
      `/organizations/${organizationId}/groups`,
      data,
    );
    return unwrap(res);
  },

  update: async (
    organizationId: string,
    groupId: string,
    data: { name?: string; description?: string; labelOverride?: string },
  ) => {
    const res = await client.patch<{ data: Group }>(
      `/organizations/${organizationId}/groups/${groupId}`,
      data,
    );
    return unwrap(res);
  },

  remove: async (organizationId: string, groupId: string) => {
    const res = await client.delete<{ data: { message: string } }>(
      `/organizations/${organizationId}/groups/${groupId}`,
    );
    return unwrap(res);
  },

  assignHosts: async (
    organizationId: string,
    groupId: string,
    hostUserIds: string[],
  ) => {
    const res = await client.post<{ data: { message: string } }>(
      `/organizations/${organizationId}/groups/${groupId}/hosts`,
      { hostUserIds },
    );
    return unwrap(res);
  },

  getOne: async (organizationId: string, groupId: string) => {
    const res = await client.get<{ data: Group }>(
      `/organizations/${organizationId}/groups/${groupId}`,
    );
    return unwrap(res);
  },

  unassignHost: async (
    organizationId: string,
    groupId: string,
    hostUserId: string,
  ) => {
    const res = await client.delete<{ data: { message: string } }>(
      `/organizations/${organizationId}/groups/${groupId}/hosts/${hostUserId}`,
    );
    return unwrap(res);
  },
};
