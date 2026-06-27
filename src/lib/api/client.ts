import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Avoid double-toasting if multiple requests 401 at once
        const alreadyRedirecting = sessionStorage.getItem("redirecting_to_login");
        if (!alreadyRedirecting) {
          sessionStorage.setItem("redirecting_to_login", "true");
          toast.error("Your session has expired. Please sign in again.");
          localStorage.removeItem("access_token");

          setTimeout(() => {
            sessionStorage.removeItem("redirecting_to_login");
            window.location.href = "/login";
          }, 1200); // give the toast time to be seen before navigating away
        }
      }
    }
    return Promise.reject(error);
  }
);

// Unwrap the API response envelope
export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}