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

// Token refresh state
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

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
      // Don't attempt refresh for auth endpoints or LiveKit requests
      const isAuthEndpoint =
        url.includes("/auth/") && !url.includes("/auth/me");
      // const isLiveKitRequest = url.includes("/livekit/") || url.includes("/token");

      // if (isAuthEndpoint || isLiveKitRequest) {
      //   return Promise.reject(error);
      // }

      const isGuestLiveKitRequest = url.includes("/livekit/guest-token");

      if (isAuthEndpoint || isGuestLiveKitRequest) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue request until refresh completes
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Dynamically import to avoid circular dependency
        const { authApi } = await import("./auth.api");
        const data = await authApi.refresh();
        const newToken = data.access_token;
        localStorage.setItem("access_token", newToken);
        onTokenRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear auth and redirect to login
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
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Unwrap the API response envelope
export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}
