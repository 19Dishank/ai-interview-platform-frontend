import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { transformSkillsPayload } from "@/lib/helpers/profile-transformers";
import { NextResponse } from "next/server";

export const PUT = withErrorHandler(async (req: Request) => {

  const body = await req.json();
  const payload = transformSkillsPayload(body);

  const response = await serverApi.put(
    "/candidate/profile/skills",
    payload
  );

  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Skills updated successfully",
    data: response.data?.data ?? response.data,
  });
});
