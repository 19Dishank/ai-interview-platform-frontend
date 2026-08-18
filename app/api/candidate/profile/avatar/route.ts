import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const response = await serverApi.get("/candidate/profile/avatar");
  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Avatar URL retrieved successfully",
    data: response.data?.data ?? response.data,
  });
});

export const DELETE = withErrorHandler(async () => {
  const response = await serverApi.delete("/candidate/profile/avatar");
  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Avatar deleted successfully",
    data: response.data?.data ?? response.data,
  });
});
