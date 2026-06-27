import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_ROUTES } from "@vokcg/constants";

/** Paths that do not require a session — everyone may access these. */
const PUBLIC_PATHS: string[] = [ADMIN_ROUTES.login];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const hasSession = request.cookies.has("__admin_s");

  if (!isPublic && !hasSession) {
    const loginUrl = new URL(ADMIN_ROUTES.login, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL(ADMIN_ROUTES.overview, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|api/).*)",
  ],
};
