import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const response = await serverApi.post("/interview/start", body);
  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message,
    data: response.data?.data ?? response.data,
  });
});
