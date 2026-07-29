export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

export const SOCKET_CONFIG = {
  transports: ["websocket"] as string[],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
};

export const GUEST_COOKIE_MAX_AGE = 60 * 60 * 4; // 4 hours
