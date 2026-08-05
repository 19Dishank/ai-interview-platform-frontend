"use client";

import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export const clientApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

clientApi.interceptors.response.use(
  (response) => {
    // if (response.data?.message) {
    //   toast.success(response.data.message);
    // }
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    // @ts-expect-error custom meta field
    if (error.config?.meta?.silent) {
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error("Network error — check your connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const isSessionCheck = error.config?.url === "/me";

    if (status === 401 || isSessionCheck) {
      toast.error(
        status === 401
          ? "Session expired. Please log in again."
          : "We couldn't verify your session. Please log in again.",
      );
      window.location.href = "/continue";
      return Promise.reject(error);
    }

    // @ts-expect-error custom meta field
    const customMessage = error.config?.meta?.errorMessage;
    const message =
      customMessage ?? data?.message ?? `Unexpected error (status ${status}).`;

    toast.error(message);
    return Promise.reject(error);
  },
);
