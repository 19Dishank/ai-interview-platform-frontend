import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req: Request) => {
  const { search } = new URL(req.url);
  const response = await serverApi.get(`/admin/users${search}`);
  return NextResponse.json(response.data);
});
