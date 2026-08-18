import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const response = await serverApi.get("/admin/templates");
  return NextResponse.json(response.data);
});

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const response = await serverApi.post("/admin/templates", body);
  return NextResponse.json(response.data);
});
