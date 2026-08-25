import { NextRequest, NextResponse } from "next/server";

const ROOT_HOSTS = ["roomscluster.com", "www.roomscluster.com", "localhost:3000", "localhost"];
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
const VERIFIED_COOKIE = "org_verified";
const VERIFIED_TTL_SECONDS = 5 * 60;

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

export async function middleware(req: NextRequest) {
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

  // ── Org subdomain validation ──
  const hostname = req.headers.get("host") ?? "";
  const subdomainSlug = getSubdomainSlug(hostname);

  if (subdomainSlug && pathname !== "/organization-not-found") {
    const verifiedCookie = req.cookies.get(VERIFIED_COOKIE)?.value;
    const alreadyVerified = verifiedCookie === subdomainSlug;

    if (!alreadyVerified) {
      try {
        const res = await fetch(`${API_URL}/organizations/by-slug/${subdomainSlug}`);

        if (res.status === 404) {
          // Genuinely doesn't exist — this is the only case we actually block on
          return NextResponse.redirect(new URL("/organization-not-found", req.url));
        }

        if (!res.ok) {
          // Rate-limited, backend hiccup, timeout, etc — NOT a real "not found".
          // Fail open: let the request through unverified rather than
          // wrongly telling a real user their org doesn't exist.
          console.warn(`Subdomain check for "${subdomainSlug}" returned ${res.status} — failing open`);
        } else {
          // Confirmed valid — remember this for a few minutes so we don't
          // re-check on every single navigation and prefetch
          const response = pathname === "/"
            ? NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", req.url))
            : NextResponse.next();
          response.cookies.set(VERIFIED_COOKIE, subdomainSlug, {
            maxAge: VERIFIED_TTL_SECONDS,
            httpOnly: true,
            sameSite: "lax",
          });
          return response;
        }
      } catch {
        // Network failure reaching the backend at all — fail open, same reasoning
        console.warn(`Subdomain check for "${subdomainSlug}" failed to reach backend — failing open`);
      }
    } else if (pathname === "/") {
      // Already verified recently, just handle the root-path redirect
      return NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", req.url));
    }
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