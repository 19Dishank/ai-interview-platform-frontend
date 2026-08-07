import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { extractGitHubRedirectUrl } from "@/lib/helpers/profile-transformers";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async () => {
  const response = await serverApi.get("/github/connect");
  const redirectUrl = extractGitHubRedirectUrl(response.data);

  if (
    redirectUrl &&
    (redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://"))
  ) {
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.json({
    success: response.data?.success ?? true,
    message: response.data?.message ?? "GitHub authorization URL fetched",
    data: redirectUrl,
  });
});