import { client, unwrap } from "./client";
import type { Session, Participant, ChatMessage, AttendanceRecord } from "@/types";

export const sessionsApi = {

  moveToFolder: async (id: string, folderId: string | null) => {
    const res = await client.patch<{ data: Session }>(`/sessions/${id}/move`, { folderId });
    return unwrap(res);
  },

  create: async (data: {
    title: string;
    description?: string;
    scheduledAt?: string;
    passcode?: string;
    folderId?: string;
  }) => {
    const res = await client.post<{ data: Session }>("/sessions", data);
    return unwrap(res);
  },

  getAll: async () => {
    const res = await client.get<{ data: Session[] }>("/sessions");
    return unwrap(res);
  },

  getOne: async (id: string) => {
    const res = await client.get<{ data: Session }>(`/sessions/${id}`);
    return unwrap(res);
  },

  getByJoinCode: async (joinCode: string) => {
    const res = await client.get<{ data: Session }>(`/sessions/join/${joinCode}`);
    return unwrap(res);
  },

  update: async (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      scheduledAt: string;
      passcode: string;
      isLocked: boolean;
    }>
  ) => {
    const res = await client.patch<{ data: Session }>(`/sessions/${id}`, data);
    return unwrap(res);
  },

  delete: async (id: string) => {
    const res = await client.delete<{ data: { message: string } }>(`/sessions/${id}`);
    return unwrap(res);
  },

  start: async (id: string) => {
    const res = await client.post<{ data: Session }>(`/sessions/${id}/start`);
    return unwrap(res);
  },

  end: async (id: string) => {
    const res = await client.post<{ data: Session }>(`/sessions/${id}/end`);
    return unwrap(res);
  },

  join: async (joinCode: string) => {
    const res = await client.post<{ data: Participant }>(`/sessions/join/${joinCode}`);
    return unwrap(res);
  },

  leave: async (joinCode: string) => {
    const res = await client.post<{ data: Participant }>(`/sessions/leave/${joinCode}`);
    return unwrap(res);
  },

  getChatHistory: async (joinCode: string) => {
    const res = await client.get<{ data: ChatMessage[] }>(`/sessions/${joinCode}/chat`);
    return unwrap(res);
  },

  getAttendance: async (id: string) => {
    const res = await client.get<{ data: AttendanceRecord[] }>(`/sessions/${id}/attendance`);
    return unwrap(res);
  },

};