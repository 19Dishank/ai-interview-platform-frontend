import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { transformExperiencePayload } from "@/lib/helpers/profile-transformers";
import { NextResponse } from "next/server";

export const PUT = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const payload = transformExperiencePayload(body);

  const response = await serverApi.put(
    "/candidate/profile/experience",
    payload,
  );

  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Experience updated successfully",
    data: response.data?.data ?? response.data,
  });
});
