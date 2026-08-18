import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const response = await serverApi.get(`/recruiter/candidates/${id}`);
    return NextResponse.json(response.data);
  },
);
