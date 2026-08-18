import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { transformBasicInfoPayload } from "@/lib/helpers/profile-transformers";
import { NextResponse } from "next/server";

export const PATCH = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const payload = transformBasicInfoPayload(body);

  const response = await serverApi.patch(
    "/candidate/profile/basic-info",
    payload,
  );

  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Basic info updated successfully",
    data: response.data?.data ?? response.data,
  });
});
