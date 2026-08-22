const isDev = process.env.NODE_ENV !== "production";

export function debugLog(...args: unknown[]) {
  if (isDev) console.log(...args);
}