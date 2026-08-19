import { client, unwrap } from "./client";

export interface Enrollment {
  id: string;
  memberEmail: string;
  status: "ACTIVE" | "INACTIVE";
  expiresAt: string | null;
  createdAt: string;
}

export interface PaginatedEnrollments {
  members: Enrollment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const enrollmentApi = {
  list: async (
    groupId: string,
    page = 1,
    pageSize = 25,
    status?: "ACTIVE" | "INACTIVE",
  ) => {
    const res = await client.get<{ data: PaginatedEnrollments }>(
      `/groups/${groupId}/members`,
      { params: { page, pageSize, status } },
    );
    return unwrap(res);
  },

  addMember: async (groupId: string, email: string, expiresAt?: string) => {
    const res = await client.post<{ data: Enrollment }>(
      `/groups/${groupId}/members`,
      { email, expiresAt },
    );
    return unwrap(res);
  },

  bulkAddMembers: async (
    groupId: string,
    emails: string[],
    expiresAt?: string,
  ) => {
    const res = await client.post<{
      data: { enrolled: number; skipped: number; total: number };
    }>(`/groups/${groupId}/members/bulk`, {
      members: emails.map((email) => ({ email })),
      expiresAt,
    });
    return unwrap(res);
  },

  removeMember: async (groupId: string, email: string) => {
    const res = await client.delete<{ data: { message: string } }>(
      `/groups/${groupId}/members`,
      { params: { email } },
    );
    return unwrap(res);
  },

  bulkRemoveMembers: async (groupId: string, emails: string[]) => {
    const res = await client.delete<{ data: { removed: number } }>(
      `/groups/${groupId}/members/bulk`,
      { data: { emails } },
    );
    return unwrap(res);
  },

  updateExpiry: async (
    groupId: string,
    email: string,
    expiresAt: string | null,
  ) => {
    const res = await client.patch<{ data: Enrollment }>(
      `/groups/${groupId}/members`,
      { email, expiresAt: expiresAt ?? "" },
    );
    return unwrap(res);
  },

  hardDelete: async (groupId: string, email: string) => {
    const res = await client.delete<{ data: { message: string } }>(
      `/groups/${groupId}/members/permanent`,
      { params: { email } },
    );
    return unwrap(res);
  },

  bulkReactivate: async (groupId: string, emails: string[]) => {
    const res = await client.post<{ data: { reactivated: number } }>(
      `/groups/${groupId}/members/bulk/reactivate`,
      { emails },
    );
    return unwrap(res);
  },

  bulkSetExpiry: async (
    groupId: string,
    emails: string[],
    expiresAt: string | null,
  ) => {
    const res = await client.patch<{ data: { updated: number } }>(
      `/groups/${groupId}/members/bulk`,
      { emails, expiresAt: expiresAt ?? "" },
    );
    return unwrap(res);
  },

  bulkHardDelete: async (groupId: string, emails: string[]) => {
    const res = await client.delete<{ data: { deleted: number } }>(
      `/groups/${groupId}/members/bulk/permanent`,
      { data: { emails } },
    );
    return unwrap(res);
  },
};
