import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
import { Role, roleTokenMap, roleRefreshMap } from "@/lib/auth/role-cookie-map";

const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

serverApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const cookieStore = await cookies();
    const roleValue = cookieStore.get("user_role")?.value as Role | undefined;
    const token = roleValue && roleTokenMap[roleValue]
      ? cookieStore.get(roleTokenMap[roleValue])?.value
      : undefined;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

serverApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    if (!error.response) return Promise.reject(error);

    const { status } = error.response;

    if (status === 401) {
      const cookieStore = await cookies();
      const roleValue = cookieStore.get("user_role")?.value as Role | undefined;
      const refreshToken = roleValue && roleRefreshMap[roleValue]
        ? cookieStore.get(roleRefreshMap[roleValue])?.value
        : undefined;
      if (refreshToken) {
        try {
          const refreshRes = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
            { refreshToken },
          );
          const newAccessToken = refreshRes.data.accessToken;
          error.config!.headers.Authorization = `Bearer ${newAccessToken}`;
          return serverApi.request(error.config!);
        } catch {
          // refresh failed too — propagate original 401
        }
      }
    }

    return Promise.reject(error);
  },
);

export default serverApi;
