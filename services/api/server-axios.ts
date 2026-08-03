import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

serverApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
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
      const refreshToken = cookieStore.get("refresh_token")?.value;
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
