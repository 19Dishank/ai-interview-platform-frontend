import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import { createServerAxios } from "@/services/api/server-axios";
import { setAuthCookies } from "@/lib/set-auth-cookies";
import { Role } from "@/lib/auth/role-cookie-map";

export interface VerifyOtpBody {
  email: string;
  otp: string;
  role: string;
}

export const POST = withErrorHandler(async (req: Request) => {
  const body: VerifyOtpBody = await req.json();
  const { email, otp, role } = body;

  if (!email || !otp || !role) {
    return NextResponse.json(
      { success: false, message: "Email and OTP are required." },
      { status: 400 },
    );
  }

  const serverApi = await createServerAxios();
  const response = await serverApi.post("/auth/verify-otp", {
    email,
    otp,
    role: role.toUpperCase(),
  });

  const { accessToken, refreshToken, user } = response.data.data;

  const res = NextResponse.json({
    success: response.data.success,
    message: response.data.message,
    data: { user },
  });

  setAuthCookies(res, user.role as Role, accessToken, refreshToken);

  return res;
});
