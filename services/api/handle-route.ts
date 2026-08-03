/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { AxiosError } from "axios";

type RouteHandler = (req: Request, ctx?: any) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: Request, ctx?: any) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return handleRouteError(err);
    }
  };
}

export function handleRouteError(err: unknown): NextResponse {
  const error = err as AxiosError<{ message?: string }>;

  if (!error.isAxiosError) {
    console.error("[Next.js route error] Crashed before calling backend:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong on our end. Please try again.",
      },
      { status: 500 },
    );
  }

  if (!error.response) {
    console.error(
      "[Backend unreachable] No response from backend server:",
      error.code, // e.g. "ECONNREFUSED", "ETIMEDOUT"
      error.message,
    );
    return NextResponse.json(
      {
        success: false,
        message:
          "Our servers are temporarily unavailable. Please try again shortly.",
      },
      { status: 503 },
    );
  }

  const { status, data } = error.response;
  console.error("[Backend error response]", status, data);

  return NextResponse.json(
    {
      success: false,
      message: data?.message ?? defaultMessageFor(status),
    },
    { status },
  );
}

function defaultMessageFor(status: number): string {
  switch (status) {
    case 400:
      return "Bad request — check the submitted data.";
    case 401:
      return "Session expired. Please log in again.";
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
