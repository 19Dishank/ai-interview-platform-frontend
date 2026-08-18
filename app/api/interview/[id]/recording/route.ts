import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";

export const GET = withErrorHandler(
  async (
    _req: Request,
    context?: { params: Promise<{ id: string }> | { id: string } }
  ) => {
    const params = await context?.params;
    const id = params?.id;
    const response = await serverApi.get(`/interview/${id}/recording`);
    return NextResponse.json({
      success: response.data?.success ?? true,
      message: response.data?.message,
      data: response.data?.data ?? response.data,
    });
  }
);
