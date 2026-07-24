import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const Axios = axios.create({
  baseURL: process.env.NEXT_SERVER_URL,
  withCredentials: true,
});

//  Request interceptor
// TODO: replace this with however you actually store the token
Axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

//  Response interceptor
Axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        console.error("Request timed out. Please try again.");
      } else {
        console.error(
          "Network error — check your connection or the server may be down.",
        );
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const errorMsg = data?.message;

    if (status == 401) {
      // implement refreshToken logic
    }

    switch (status) {
      case 400:
        console.error(errorMsg || "Bad request — check the submitted data.");
        break;

      case 401:
        console.error(errorMsg || "Session expired. Please log in again.");
        // TODO: clear stored token + redirect to /login
        // localStorage.removeItem("token");
        // window.location.href = "/login";
        break;

      case 403:
        console.error(errorMsg || "You don't have permission to do that.");
        break;

      case 404:
        console.error(errorMsg || "The requested resource was not found.");
        break;

      case 408:
        console.error(errorMsg || "Request timed out. Please try again.");
        break;

      case 409:
        console.error(
          errorMsg ||
            "Conflict — this resource already exists or was modified.",
        );
        break;

      case 422:
        console.error(
          errorMsg || "Validation failed. Please check your input.",
        );
        break;

      case 429:
        console.error(errorMsg || "Too many requests — please slow down.");
        break;

      case 500:
        console.error(
          errorMsg ||
            "Something went wrong on our end. Please try again later.",
        );
        break;

      case 502:
      case 503:
      case 504:
        console.error(
          errorMsg ||
            "Server is temporarily unavailable. Please try again shortly.",
        );
        break;

      default:
        console.error(errorMsg || `Unexpected error (status ${status}).`);
    }

    return Promise.reject(error);
  },
);
