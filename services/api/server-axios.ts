import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  Role,
  getRoleCookieName,
  roleRefreshMap,
} from "@/lib/auth/role-cookie-map";
import { setAuthCookies } from "@/lib/set-auth-cookies";

const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

async function performRefresh(
  role: Role,
  refreshToken: string,
): Promise<string> {
  const refreshRes = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`,
    { refreshToken },
  );

  const { accessToken, refreshToken: newRefreshToken } =
    refreshRes.data.data ?? {};

  if (!accessToken || !newRefreshToken) {
    throw new Error("Refresh response missing accessToken/refreshToken");
  }

  const cookieStore = await cookies();
  setAuthCookies(
    { cookies: cookieStore } as unknown as NextResponse,
    role,
    accessToken,
    newRefreshToken,
  );

  return accessToken;
}

serverApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const cookieStore = await cookies();
    const roleValue = cookieStore.get("user_role")?.value as Role | undefined;
    const tokenCookieName = getRoleCookieName(roleValue);
    const token = tokenCookieName
      ? cookieStore.get(tokenCookieName)?.value
      : undefined;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

serverApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response) return Promise.reject(error);

    const originalConfig = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    if (
      error.response.status !== 401 ||
      !originalConfig ||
      originalConfig._retried
    ) {
      return Promise.reject(error);
    }

    const cookieStore = await cookies();
    const roleValue = cookieStore.get("user_role")?.value as Role | undefined;
    const refreshToken =
      roleValue && roleRefreshMap[roleValue]
        ? cookieStore.get(roleRefreshMap[roleValue])?.value
        : undefined;

    if (!roleValue || !refreshToken) return Promise.reject(error);

    try {
      if (!refreshPromise) {
        refreshPromise = performRefresh(roleValue, refreshToken).finally(() => {
          refreshPromise = null;
        });
      }
      const newAccessToken = await refreshPromise;
      originalConfig._retried = true;
      originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
      return serverApi.request(originalConfig);
    } catch (refreshError) {
      // TEMP — remove once diagnosed
      console.error(
        "[refresh failed]",
        axios.isAxiosError(refreshError)
          ? {
              status: refreshError.response?.status,
              data: refreshError.response?.data,
            }
          : refreshError,
      );

      cookieStore.delete("user_role");
      const accessCookieName = getRoleCookieName(roleValue);
      const refreshCookieName = getRoleCookieName(roleValue, "refresh");
      if (accessCookieName) cookieStore.delete(accessCookieName);
      if (refreshCookieName) cookieStore.delete(refreshCookieName);
      return Promise.reject(error);
    }
  },
);

export default serverApi;
