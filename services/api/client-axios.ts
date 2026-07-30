"use client";

import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export const clientApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

clientApi.interceptors.response.use(
  (response) => {
    if (response.data?.message) {
      toast.success(response.data.message);
    }
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

    if (status === 401) {
      toast.error("Session expired. Please log in again.");
      window.location.href = "/continue";
      return Promise.reject(error);
    }

    // @ts-expect-error custom meta field
    const customMessage = error.config?.meta?.errorMessage;
    const message = customMessage ?? data?.message ?? defaultMessageFor(status);

    toast.error(message);
    return Promise.reject(error);
  },
);

function defaultMessageFor(status: number): string {
  switch (status) {
    case 400:
      return "Bad request — check the submitted data.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "The requested resource was not found.";
    case 408:
      return "Request timed out. Please try again.";
    case 409:
      return "Conflict — this resource already exists or was modified.";
    case 422:
      return "Validation failed. Please check your input.";
    case 429:
      return "Too many requests — please slow down.";
    case 500:
      return "Something went wrong on our end. Please try again later.";
    case 502:
    case 503:
    case 504:
      return "Server is temporarily unavailable. Please try again shortly.";
    default:
      return `Unexpected error (status ${status}).`;
  }
}
