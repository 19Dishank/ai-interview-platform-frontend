{
  // // middleware.ts
  // import { NextResponse } from "next/server";
  // import type { NextRequest } from "next/server";
  // const PUBLIC_ROUTES = [
  //   "/",
  //   "/login",
  //   "/signup",
  //   "/verify-email",
  //   "/forgot-password",
  //   "/reset-password",
  // ];
  // const ADMIN_ROUTES = [
  //   "/admin/dashboard",
  //   "/admin/users",
  //   "/admin/templates",
  //   "/admin/subscriptions",
  // ];
  // const CANDIDATE_ROUTES = [
  //   "/candidate/dashboard",
  //   "/candidate/report",
  //   "/candidate/history",
  //   "/candidate/interview-setup",
  //   "/candidate/interview",
  //   "/candidate/processing",
  //   "/candidate/profile/build",
  // ];
  // const RECRUITER_ROUTES = [
  //   "/recruiter/search",
  //   "/recruiter/compare",
  //   "/recruiter/candidate",
  // ];
  // // todo it should not change url to the _not-found, keep url same but show user a notfound page
  // export async function proxy(req: NextRequest) {
  //   const token = true;
  //   const { pathname } = req.nextUrl;
  //   console.log("🚀 ~ proxy.ts:38 ~ pathname:", pathname);
  //   // 1. Unauthenticated users seeking secure pages -> redirect to login
  //   if (!token) {
  //     if (
  //       pathname.startsWith("/candidate") ||
  //       pathname.startsWith("/recruiter") ||
  //       pathname.startsWith("/admin")
  //     ) {
  //       return NextResponse.redirect(new URL("/login", req.url));
  //     }
  //   }
  //   // 2. Role-based Access Control (RBAC)
  //   if (token) {
  //     const userRole = "recruiter"; // 'candidate' | 'recruiter' | 'admin'
  //     if (pathname.startsWith("/admin") && userRole !== "admin") {
  //       return NextResponse.redirect(new URL(pathname, req.url));
  //     }
  //     if (
  //       pathname.startsWith("/recruiter") &&
  //       userRole !== "recruiter" &&
  //       userRole !== "admin"
  //     ) {
  //       return NextResponse.redirect(new URL(pathname, req.url));
  //     }
  //     if (pathname.startsWith("/candidate") && userRole !== "candidate") {
  //       return NextResponse.redirect(new URL(pathname, req.url));
  //     }
  //   }
  //   return NextResponse.next();
  // }
  // export const config = {
  //   matcher: ["/candidate/:path*", "/recruiter/:path*", "/admin/:path*"],
  // };
}

import { NextRequest, NextResponse } from "next/server";

// TODO: replace with real auth check once backend is ready
// e.g. read from cookies: const token = req.cookies.get("token")?.value;
const token = true;
const userRole: "candidate" | "recruiter" | "admin" = "admin";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Unauthenticated users seeking protected pages -> redirect to login
  if (!token) {
    if (
      pathname.startsWith("/candidate") ||
      pathname.startsWith("/recruiter") ||
      pathname.startsWith("/admin")
    ) {
      const loginUrl = new URL("/login", req.url);
      // loginUrl.searchParams.set("callbackUrl", pathname); // optional but handy
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Role-based Access Control (RBAC)
  // Each role may only access its own section — no role, including admin,
  // gets implicit access to another role's routes.
  const isUnauthorized =
    (pathname.startsWith("/admin") && userRole !== "admin") ||
    (pathname.startsWith("/recruiter") && userRole !== "recruiter") ||
    (pathname.startsWith("/candidate") && userRole !== "candidate");

  if (isUnauthorized) {
    // Keep the URL exactly as the user typed it, but SERVE a not-found page.
    // rewrite() changes what's rendered without touching the browser's address bar.
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/candidate/:path*", "/recruiter/:path*", "/admin/:path*"],
};
