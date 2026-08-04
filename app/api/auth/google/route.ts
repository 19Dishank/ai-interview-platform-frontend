import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { setAuthCookies } from "@/lib/set-auth-cookies";
import { Role } from "@/lib/auth/role-cookie-map";

export interface GoogleAuthBody {
  idToken: string;
  role: string;
}

export const POST = withErrorHandler(async (req: Request) => {
  const body: GoogleAuthBody = await req.json();
  const { idToken, role } = body;

  if (!idToken || !role) {
    return NextResponse.json(
      { success: false, message: "Google idToken and role are required." },
      { status: 400 },
    );
  }

  const response = await serverApi.post("/auth/google", {
    idToken,
    role: role.toUpperCase(),
  });

  const { accessToken, refreshToken, user } = response.data.data ?? {};

  if (!accessToken || !refreshToken) {
    console.error(
      "[Google auth] Unexpected backend response shape:",
      response.data,
    );
    return NextResponse.json(
      { success: false, message: "Google sign-in failed. Please try again." },
      { status: 502 },
    );
  }

  const res = NextResponse.json({
    success: response.data.success,
    message: response.data.message,
    data: { user },
  });

  setAuthCookies(res, user.role as Role, accessToken, refreshToken);

  return res;
});
