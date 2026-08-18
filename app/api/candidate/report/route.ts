import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const interviewId = searchParams.get("interviewId");
  const url = interviewId ? `/candidate/report?interviewId=${interviewId}` : "/candidate/report";
  const response = await serverApi.get(url);
  return NextResponse.json(response.data);
});
