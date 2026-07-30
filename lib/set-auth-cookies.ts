import { NextResponse } from "next/server";
import { Role, roleRefreshMap, roleTokenMap } from "./auth/role-cookie-map";

export function setAuthCookies(
  res: NextResponse,
  role: Role,
  accessToken: string,
  refreshToken: string,
) {
  res.cookies.set(roleTokenMap[role], accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 min
  });

  res.cookies.set(roleRefreshMap[role], refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  res.cookies.set("user_role", role, {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}
