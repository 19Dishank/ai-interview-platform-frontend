import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const response = await serverApi.get("/admin/dashboard/charts");
  return NextResponse.json(response.data);
});
