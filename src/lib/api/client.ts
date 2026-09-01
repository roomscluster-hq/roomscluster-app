import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ← sends cookies with every request
});

// A single in-flight refresh, shared by every concurrent 401 — replaces
// the old isRefreshing boolean + subscriber queue, which let multiple
// parallel failing requests each start their own separate refresh attempt
// (and each fire their own logout on failure).
let refreshPromise: Promise<string> | null = null;

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto refresh on 401
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url ?? "";
      // Don't attempt refresh for auth endpoints or guest LiveKit requests
      const isAuthEndpoint =
        url.includes("/auth/") && !url.includes("/auth/me");
      const isGuestLiveKitRequest = url.includes("/livekit/guest-token");

      if (isAuthEndpoint || isGuestLiveKitRequest) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Only the FIRST failing request starts a refresh. Every other
      // concurrent 401 awaits this same promise instead of kicking off
      // its own — this is what stops the repeated refresh/logout storm.
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const { authApi } = await import("./auth.api");
            const data = await authApi.refresh();
            const newToken = data.access_token;
            localStorage.setItem("access_token", newToken);
            return newToken;
          } catch (refreshError) {
            // Refresh failed — clear auth and redirect to login.
            // This now only ever runs ONCE per real expiry, no matter
            // how many requests failed at the same moment.
            localStorage.removeItem("access_token");
            await useAuthStore.getState().clearAuth();
            const alreadyRedirecting = sessionStorage.getItem(
              "redirecting_to_login",
            );
            if (!alreadyRedirecting) {
              sessionStorage.setItem("redirecting_to_login", "true");
              toast.error("Your session has expired. Please sign in again.");
              setTimeout(() => {
                sessionStorage.removeItem("redirecting_to_login");
                window.location.href = "/login";
              }, 1200);
            }
            throw refreshError;
          } finally {
            // Clear the shared promise once settled, so the NEXT time
            // a token genuinely expires, a fresh refresh attempt can start
            refreshPromise = null;
          }
        })();
      }

      try {
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Catch plan-gate errors specifically (upgradeRequired: true) and surface
// the upgrade modal — separate from the refresh-token interceptor above,
// which only ever handles 401s. This one only ever handles 403s carrying
// this specific extra field, so it can never fire for an ordinary
// permission error (e.g. "Only the host or co-host can...").
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const data = error.response?.data as
      | {
          message?: string;
          upgradeRequired?: boolean;
          suggestedPlan?: "PRO" | "BUSINESS";
        }
      | undefined;

    if (error.response?.status === 403 && data?.upgradeRequired) {
      const { useUpgradePromptStore } =
        await import("@/store/upgrade-prompt.store");
      useUpgradePromptStore
        .getState()
        .show(
          data.message ?? "This requires a higher plan.",
          data.suggestedPlan ?? null,
        );
    }

    return Promise.reject(error);
  },
);

// Unwrap the API response envelope
export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}
