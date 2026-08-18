import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const response = await serverApi.post("/recruiter/candidates/compare", body);
  return NextResponse.json(response.data);
});
