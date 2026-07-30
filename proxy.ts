import { NextRequest, NextResponse } from "next/server";
import { Role, roleTokenMap } from "./lib/auth/role-cookie-map";

const ROLE_DASHBOARD: Record<Role, string> = {
  CANDIDATE: "/candidate/profile/build",
  RECRUITER: "/recruiter/search",
  ADMIN: "/admin",
};

function getActiveSession(
  req: NextRequest,
): { role: Role; token: string } | null {
  const roleCookie = req.cookies.get("user_role")?.value as Role | undefined;

  if (!roleCookie || !roleTokenMap[roleCookie]) return null;

  const tokenCookieName = roleTokenMap[roleCookie];
  const token = req.cookies.get(tokenCookieName)?.value;

  if (!token) return null;

  return { role: roleCookie, token };
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = getActiveSession(req);

  const isEntryRoute = pathname === "/" || pathname.startsWith("/continue");
  if (isEntryRoute && session) {
    return NextResponse.redirect(
      new URL(ROLE_DASHBOARD[session.role], req.url),
    );
  }

  const isProtectedRoute =
    pathname.startsWith("/candidate") ||
    pathname.startsWith("/recruiter") ||
    pathname.startsWith("/admin");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/continue", req.url);
    // loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const routeRole = pathname.split("/")[1].toUpperCase() as Role;

  if (session.role !== routeRole) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/continue/:path*",
    "/candidate/:path*",
    "/recruiter/:path*",
    "/admin/:path*",
  ],
};
