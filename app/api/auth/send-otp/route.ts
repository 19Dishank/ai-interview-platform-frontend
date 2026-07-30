import { withErrorHandler } from "@/services/api/handle-route";
import { createServerAxios } from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export interface SendOtpBody {
  email: string;
  role: "candidate" | "recruiter";
}

export const POST = withErrorHandler(async (req: Request) => {
  const body: SendOtpBody = await req.json();
  const { email, role } = body;

  if (!email || !role) {
    return NextResponse.json(
      {
        success: false,
        message: "Email and role are required.",
      },
      { status: 400 },
    );
  }

  const serverApi = await createServerAxios();

  const response = await serverApi.post("/auth/send-otp", {
    email,
    role: role.toUpperCase(),
  });

  return NextResponse.json({
    success: response.data.success,
    message: response.data.message,
  });
});
