import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const response = await serverApi.post(`/recruiter/candidates/${id}/contact`, body);
    return NextResponse.json(response.data);
  },
);
