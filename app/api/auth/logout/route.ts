import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorHandler } from "@/services/api/handle-route";
import {
  Role,
  getRoleCookieName,
} from "@/lib/auth/role-cookie-map";
import serverApi from "@/services/api/server-axios";
import { clearAuthCookies } from "@/lib/set-auth-cookies";

export const POST = withErrorHandler(async () => {
  const cookieStore = await cookies();
  const roleValue = cookieStore.get("user_role")?.value as Role | undefined;

  const refreshCookieName = getRoleCookieName(roleValue, "refresh");
  const refreshToken = refreshCookieName
    ? cookieStore.get(refreshCookieName)?.value
    : undefined;

  if (refreshToken) {
    try {
      await serverApi.post("auth/logout", { refreshToken });
    } catch {}
  }

  const response = NextResponse.json({ success: true });

  clearAuthCookies(response);

  return response;
});
