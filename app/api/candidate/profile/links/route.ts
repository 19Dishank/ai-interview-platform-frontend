import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { transformLinksPayload } from "@/lib/helpers/profile-transformers";
import { NextResponse } from "next/server";

export const PATCH = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const payload = transformLinksPayload(body);

  const response = await serverApi.patch(
    "/candidate/profile/links",
    payload,
  );

  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Links updated and profile completed successfully",
    data: response.data?.data ?? response.data,
  });
});
