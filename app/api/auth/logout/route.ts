import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorHandler } from "@/services/api/handle-route";
import { Role, roleRefreshMap, roleTokenMap } from "@/lib/auth/role-cookie-map";

export const POST = withErrorHandler(async () => {
  const cookieStore = await cookies();
  const role = cookieStore.get("user_role")?.value as Role | undefined;

  const response = NextResponse.json({ success: true });

  response.cookies.delete("user_role");

  if (role && roleTokenMap[role]) {
    response.cookies.delete(roleTokenMap[role]);
    response.cookies.delete(roleRefreshMap[role]);
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
