import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorHandler } from "@/services/api/handle-route";
import { Role, roleRefreshMap, roleTokenMap } from "@/lib/auth/role-cookie-map";
import serverApi from "@/services/api/server-axios";

export const POST = withErrorHandler(async () => {
  const cookieStore = await cookies();
  const roleValue = cookieStore.get("user_role")?.value as Role | undefined;

  const refreshToken =
    roleValue && roleRefreshMap[roleValue]
      ? cookieStore.get(roleRefreshMap[roleValue])?.value
      : undefined;

  if (refreshToken) {
    try {
      await serverApi.post("auth/logout", { refreshToken });
    } catch {}
  }

  const response = NextResponse.json({ success: true });

  response.cookies.delete("user_role");

  if (roleValue && roleTokenMap[roleValue]) {
    response.cookies.delete(roleTokenMap[roleValue]);
    response.cookies.delete(roleRefreshMap[roleValue]);
  } else {
    Object.values(roleTokenMap).forEach((cookieName) => {
      response.cookies.delete(cookieName);
    });
    Object.values(roleRefreshMap).forEach((cookieName) => {
      response.cookies.delete(cookieName);
    });
  }

  return response;
});
