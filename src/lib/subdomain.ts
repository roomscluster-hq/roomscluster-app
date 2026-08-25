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

export function getRootHost(host: string): string {
  const [hostname, port] = host.split(":");
  const portSuffix = port ? `:${port}` : "";

  if (hostname.endsWith(".roomscluster.com") || hostname === "roomscluster.com") {
    return "roomscluster.com";
  }
  if (hostname.endsWith(".localhost") || hostname === "localhost") {
    return `localhost${portSuffix}`;
  }
  return host;
}