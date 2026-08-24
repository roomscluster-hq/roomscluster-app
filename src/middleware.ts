import { NextRequest, NextResponse } from "next/server";

const ROOT_HOSTS = ["roomscluster.com", "www.roomscluster.com", "localhost:3000", "localhost"];

function getSubdomainSlug(hostname: string): string | null {
  const hostWithoutPort = hostname.split(":")[0];

  if (ROOT_HOSTS.includes(hostname) || ROOT_HOSTS.includes(hostWithoutPort)) {
    return null;
  }

  const parts = hostWithoutPort.split(".");
  if (hostWithoutPort.endsWith(".roomscluster.com") && parts.length === 3) {
    return parts[0];
  }
  if (hostWithoutPort.endsWith(".localhost") && parts.length === 2) {
    return parts[0];
  }

  return null;
}

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const guestToken = req.cookies.get("guest_token")?.value;
  const isLoggedIn = !!accessToken;
  const isGuest = !!guestToken;
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isGuestJoinPage = /^\/room\/[^/]+\/join$/.test(pathname);
  const isWaitingPage = /^\/room\/[^/]+\/waiting$/.test(pathname);
  const isRoomPage = /^\/room\/[^/]+$/.test(pathname);
  const isDashboard = pathname.startsWith("/dashboard");

  if (isGuestJoinPage) {
    return NextResponse.next();
  }

  if (isWaitingPage) {
    return NextResponse.next();
  }

  // ── Org subdomain — skip the marketing page entirely, before any HTML
  // is rendered. Only fires on the bare root "/", so it never interferes
  // with normal navigation elsewhere on the app (e.g. /room/xyz).
  const hostname = req.headers.get("host") ?? "";
  const subdomainSlug = getSubdomainSlug(hostname);
  if (subdomainSlug && pathname === "/") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isRoomPage && !isLoggedIn && !isGuest) {
    const joinCode = pathname.split("/")[2];
    return NextResponse.redirect(new URL(`/room/${joinCode}/join`, req.url));
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};