import { client, unwrap } from "./client";
import type { User, Session } from "@/types";

export const usersApi = {
  getProfile: async () => {
    const res = await client.get<{ data: User }>("/users/me");
    return unwrap(res);
  },

  update: async (data: {
    name?: string;
    email?: string;
    image?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const res = await client.patch<{ data: User }>("/users/me", data);
    return unwrap(res);
  },

  getSessions: async () => {
    const res = await client.get<{ data: Session[] }>("/users/me/sessions");
    return unwrap(res);
  },

  deleteAccount: async () => {
    const res = await client.delete<{ data: { message: string } }>("/users/me");
    return unwrap(res);
  },
};