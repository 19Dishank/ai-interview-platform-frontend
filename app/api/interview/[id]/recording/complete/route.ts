import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";

export const POST = withErrorHandler(
  async (
    req: Request,
    context?: { params: Promise<{ id: string }> | { id: string } }
  ) => {
    const params = await context?.params;
    const id = params?.id;
    const body = await req.json().catch(() => ({}));
    const response = await serverApi.post(`/interview/${id}/recording/complete`, body);
    return NextResponse.json({
      success: response.data?.success ?? true,
      message: response.data?.message,
      data: response.data?.data ?? response.data,
    });
  }
);
