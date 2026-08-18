import axios from "axios";
import { cookies } from "next/headers";
import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";
import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/set-auth-cookies";
import { Role } from "@/lib/auth/role-cookie-map";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  try {
    const response = await serverApi.get("/auth/me");
    const user = response.data?.data ?? null;

    const cookieStore = await cookies();
    const cookieRole = cookieStore.get("user_role")?.value as Role | undefined;

    if (!user || !cookieRole || user.role !== cookieRole) {
      const invalidSession = NextResponse.json(
        { success: false, message: "Invalid session. Please log in again." },
        { status: 401 },
      );
      clearAuthCookies(invalidSession);
      return invalidSession;
    }

    return NextResponse.json({
      success: response.data?.success ?? true,
      message: response.data?.message ?? "OK",
      data: { user },
    });
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? (error.response?.status ?? 503)
      : 500;
    const response = NextResponse.json(
      {
        success: false,
        message:
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "We couldn't verify your session. Please log in again.",
      },
      { status },
    );
    clearAuthCookies(response);
    return response;
  }
});
