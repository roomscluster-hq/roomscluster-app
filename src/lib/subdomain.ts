const ROOT_DOMAINS = ["roomscluster.com", "localhost", "vercel.app"];

export function getSubdomainSlug(): string | null {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname;

  if (ROOT_DOMAINS.includes(host) || host === "www.roomscluster.com") {
    return null;
  }

  if (host.endsWith(".roomscluster.com") && host.split(".").length === 3) {
    return host.split(".")[0];
  }

  // Local dev only — lets you test via e.g. daniellas.localhost:3000
  if (host.endsWith(".localhost")) {
    return host.split(".")[0];
  }

  return null;
}

export function getRootHost(hostname: string): string {
  const slug = getSubdomainSlug();
  if (!slug) return hostname; // already on the root, nothing to strip

  const hostWithoutPort = hostname.split(":")[0];
  const port = hostname.includes(":") ? ":" + hostname.split(":")[1] : "";

  if (hostWithoutPort.endsWith(".roomscluster.com")) {
    return "roomscluster.com";
  }
  if (hostWithoutPort.endsWith(".localhost")) {
    return "localhost" + port;
  }
  return hostname;
}