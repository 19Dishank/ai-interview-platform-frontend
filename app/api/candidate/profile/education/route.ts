import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { transformEducationPayload } from "@/lib/helpers/profile-transformers";
import { NextResponse } from "next/server";

export const PUT = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const payload = transformEducationPayload(body);

  const response = await serverApi.put(
    "/candidate/profile/education",
    payload,
  );

  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Education updated successfully",
    data: response.data?.data ?? response.data,
  });
});
