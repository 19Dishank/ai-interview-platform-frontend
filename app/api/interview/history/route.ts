import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ?? "20";
  const offset = searchParams.get("offset") ?? "0";
  const response = await serverApi.get(
    `/interview/history?limit=${limit}&offset=${offset}`
  );
  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message,
    data: response.data?.data ?? response.data,
  });
});
