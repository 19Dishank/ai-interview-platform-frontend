import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

export async function createServerAxios() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string }>) => {
      if (!error.response) {
        return Promise.reject(error);
      }

      const { status } = error.response;

      if (status === 401) {
        const refreshToken = cookieStore.get("refresh_token")?.value;
        if (refreshToken) {
          try {
            const refreshRes = await axios.post(
              `${process.env.BACKEND_URL}/auth/refresh`,
              { refreshToken },
            );
            const newAccessToken = refreshRes.data.accessToken;

            // retry original request with new token
            error.config!.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance.request(error.config!);

            // NOTE: you still need to persist newAccessToken back into the
            // cookie — easiest done by having the route handler that calls
            // this catch a "TOKEN_REFRESHED" signal and re-set the cookie.
            // Simpler alternative: do refresh logic in middleware.ts instead
            // (see note below).
          } catch {
            // refresh failed too — let it propagate as 401
          }
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}
