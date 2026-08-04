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

  sendMagicLink: async (email: string) => {
    const res = await client.post<{ data: { message: string } }>(
      "/auth/magic-link",
      { email }
    );
    return unwrap(res);
  },

  verifyMagicLink: async (token: string) => {
    const res = await client.post<{ data: { access_token: string; user: { id: string; email: string } } }>(
      "/auth/magic-link/verify",
      { token }
    );
    return unwrap(res);
  },

  refresh: async () => {
    // Refresh token is sent automatically via httpOnly cookie
    const res = await client.post<{ data: { access_token: string; user: { id: string; email: string } } }>(
      "/auth/refresh",
      {},
      { withCredentials: true }
    );
    return unwrap(res);
  },

  logout: async () => {
    const res = await client.post<{ data: { message: string } }>(
      "/auth/logout",
      {},
      { withCredentials: true }
    );
    return unwrap(res);
  },
};