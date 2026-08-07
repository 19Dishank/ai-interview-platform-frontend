import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const response = await serverApi.get("/candidate/profile/resume");
  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Resume URL retrieved successfully",
    data: response.data?.data ?? response.data,
  });
});

export const DELETE = withErrorHandler(async () => {
  const response = await serverApi.delete("/candidate/profile/resume");
  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Resume deleted successfully",
    data: response.data?.data ?? response.data,
  });
});
