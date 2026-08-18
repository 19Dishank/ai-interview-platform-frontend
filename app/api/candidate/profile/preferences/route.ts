import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { transformPreferencesPayload } from "@/lib/helpers/profile-transformers";
import { NextResponse } from "next/server";

export const PATCH = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const payload = transformPreferencesPayload(body);

  const response = await serverApi.patch(
    "/candidate/profile/preferences",
    payload,
  );

  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "Preferences updated successfully",
    data: response.data?.data ?? response.data,
  });
});
