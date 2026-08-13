import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import { cookies } from "next/headers";

export const GET = withErrorHandler(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("candidate_token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { token },
  });
});
