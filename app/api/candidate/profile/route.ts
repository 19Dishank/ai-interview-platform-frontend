import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { transformCandidateProfile } from "@/lib/helpers/profile-transformers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const response = await serverApi.get("/candidate/profile");
  const rawData = response.data?.data ?? response.data;
  const convertedData = transformCandidateProfile(rawData);

  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Profile fetched successfully",
    data: convertedData,
  });
});
