import { NextRequest, NextResponse } from "next/server";
import { Role, roleTokenMap, roleRefreshMap } from "./lib/auth/role-cookie-map";

const ROLE_DASHBOARD: Record<Role, string> = {
  CANDIDATE: "/candidate/dashboard",
  RECRUITER: "/recruiter/search",
  ADMIN: "/admin",
};

function getActiveSession(req: NextRequest): { role: Role } | null {
  const rawRole = req.cookies.get("user_role")?.value;
  const roleCookie = rawRole ? (rawRole.toUpperCase() as Role) : undefined;

  if (!roleCookie || !roleTokenMap[roleCookie] || !roleRefreshMap[roleCookie]) {
    return null;
  }

  const hasAccessToken = !!req.cookies.get(roleTokenMap[roleCookie])?.value;
  const hasRefreshToken = !!req.cookies.get(roleRefreshMap[roleCookie])?.value;

  if (!hasAccessToken && !hasRefreshToken) return null;
  if (!hasRefreshToken) return null;

  return { role: roleCookie };
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

  if (!isProtectedRoute) return NextResponse.next();

  if (!session) {
    return NextResponse.redirect(new URL("/continue", req.url));
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
