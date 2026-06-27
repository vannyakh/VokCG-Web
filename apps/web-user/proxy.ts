import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { USER_ROUTES } from "@vokcg/constants";

/** Paths that do not require a session — everyone may access these. */
const PUBLIC_PATHS: string[] = [USER_ROUTES.login, USER_ROUTES.register];

/**
 * Studio (web-user) Proxy (Next.js 16).
 *
 * Performs an optimistic auth check via the __user_s session-presence cookie:
 *  - Unauthenticated requests to protected routes → redirect to /login
 *  - Authenticated requests to /login or /register → redirect to /create
 *
 * The cookie is written by the user auth store (store/auth-store.ts) when
 * a session is established and cleared on logout. Real token validation is
 * always performed server-side by the API; this Proxy only handles fast
 * routing to avoid unnecessary client-side round-trips.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const hasSession = request.cookies.has("__user_s");

  if (!isPublic && !hasSession) {
    const loginUrl = new URL(USER_ROUTES.login, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL(USER_ROUTES.create, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - _next/static  (static assets)
     *  - _next/image   (image optimisation)
     *  - favicon.ico, robots.txt
     *  - /api/*  (API routes — handled by the backend proxy)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|api/).*)",
  ],
};
