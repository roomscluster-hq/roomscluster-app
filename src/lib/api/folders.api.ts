import { client, unwrap } from "./client";
import type { Folder, Session } from "@/types";

export interface PaginationInfo {
  skip: number;
  take: number;
  totalCount: number;
  hasMore: boolean;
  nextSkip: number | null;
}

export interface FolderContents {
  folders: (Folder & { _count: { sessions: number; subFolders: number } })[];
  sessions: Session[];
  pagination: PaginationInfo;
}

export interface Breadcrumb {
  id: string;
  name: string;
}

export const foldersApi = {
  create: async (data: { name: string; parentFolderId?: string }) => {
    const res = await client.post<{ data: Folder }>("/folders", data);
    return unwrap(res);
  },

  getContents: async (
    folderId?: string,
    skip = 0,
    take = 30,
    status?: string,
    groupId?: string,
  ) => {
    const res = await client.get<{ data: FolderContents }>(
      "/folders/contents",
      {
        params: {
          ...(folderId ? { folderId } : {}),
          ...(status && status !== "ALL" ? { status } : {}),
          ...(groupId && groupId !== "ALL" ? { groupId } : {}),
          skip,
          take,
        },
      },
    );
    return unwrap(res);
  },

  getBreadcrumbs: async (folderId: string) => {
    const res = await client.get<{ data: Breadcrumb[] }>(
      `/folders/${folderId}/breadcrumbs`,
    );
    return unwrap(res);
  },

  rename: async (id: string, name: string) => {
    const res = await client.patch<{ data: Folder }>(`/folders/${id}`, {
      name,
    });
    return unwrap(res);
  },

  move: async (id: string, parentFolderId: string | null) => {
    const res = await client.patch<{ data: Folder }>(`/folders/${id}/move`, {
      parentFolderId,
    });
    return unwrap(res);
  },

  delete: async (id: string) => {
    const res = await client.delete<{ data: { message: string } }>(
      `/folders/${id}`,
    );
    return unwrap(res);
  },
};
