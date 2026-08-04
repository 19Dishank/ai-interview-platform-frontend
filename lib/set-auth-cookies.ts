import { NextResponse } from "next/server";
import { Role, getRoleCookieName } from "./auth/role-cookie-map";

export function setAuthCookies(
  res: NextResponse,
  role: Role,
  accessToken: string,
  refreshToken: string,
) {
  const isProd = process.env.NODE_ENV === "production";
  const accessCookieName = getRoleCookieName(role);
  const refreshCookieName = getRoleCookieName(role, "refresh");

  if (!accessCookieName || !refreshCookieName) {
    return;
  }

  res.cookies.set(accessCookieName, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5, // 15 min
  });

  res.cookies.set(refreshCookieName, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  res.cookies.set("user_role", role, {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}
