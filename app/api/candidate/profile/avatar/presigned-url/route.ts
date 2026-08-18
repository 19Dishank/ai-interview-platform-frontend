import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();

  const { fileName, contentType, fileType } = body;
  const effectiveContentType = contentType || fileType || "image/jpeg";

  const response = await serverApi.post(
    "/candidate/profile/avatar/presigned-url",
    {
      fileName,
      contentType: effectiveContentType,
    },
  );

  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Avatar upload URL generated successfully",
    data: response.data?.data ?? response.data,
  });
});
