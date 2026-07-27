import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const guestToken = req.cookies.get("guest_token")?.value;
  const isLoggedIn = !!accessToken;
  const isGuest = !!guestToken;
  const { pathname } = req.nextUrl;

  console.log(`[Middleware] ${pathname} | loggedIn: ${isLoggedIn} | guest: ${isGuest}`);

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

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isRoomPage && !isLoggedIn && !isGuest) {
    const joinCode = pathname.split("/")[2];
    console.log(`[Middleware] Redirecting to guest join for: ${joinCode}`);
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