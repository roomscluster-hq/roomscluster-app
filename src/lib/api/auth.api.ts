import { client, unwrap } from "./client";
import type { AuthResponse, User } from "@/types";

export const authApi = {
  register: async (data: { name: string; email: string; password: string }) => {
    const res = await client.post<{ data: AuthResponse }>("/auth/register", data);
    return unwrap(res);
  },

  login: async (data: { email: string; password: string }) => {
    const res = await client.post<{ data: AuthResponse }>("/auth/login", data);
    return unwrap(res);
  },

  me: async () => {
    const res = await client.get<{ data: User }>("/auth/me");
    return unwrap(res);
  },

  forgotPassword: async (email: string) => {
    const res = await client.post<{ data: { message: string } }>(
      '/auth/forgot-password',
      { email }
    );
    return unwrap(res);
  },

  resetPassword: async (token: string, password: string) => {
    const res = await client.post<{ data: { message: string } }>(
      '/auth/reset-password',
      { token, password }
    );
    return unwrap(res);
  },
};