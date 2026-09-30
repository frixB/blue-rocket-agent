import { NextResponse, type NextRequest } from "next/server";
import { hasAdminSession, isPublicAdminPath } from "@/lib/admin/auth-gate";

/**
 * The early admin check: anyone without a session is sent to sign-in before a
 * page renders. It is optimistic only; currentAdmin() checks again on the
 * server for every admin page and action.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isPublicAdminPath(pathname) || hasAdminSession(request.cookies)) return NextResponse.next();
  const url = new URL("/admin/sign-in", request.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
