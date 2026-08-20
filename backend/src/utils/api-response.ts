import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ValidationError } from "./errors";
import { logger } from "@/lib/logger";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function successResponse<T>(
  data: T,
  options?: { message?: string; status?: number; pagination?: ApiSuccessResponse<T>["pagination"] },
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      message: options?.message ?? "Request successful",
      ...(options?.pagination && { pagination: options.pagination }),
    },
    { status: options?.status ?? 200 },
  );
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code: error.code,
          message: error.message,
          ...(error instanceof ValidationError && error.details
            ? { details: error.details }
            : {}),
        },
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: error.issues,
        },
      },
      { status: 422 },
    );
  }

  logger.error("Unhandled API error", {
    error: error instanceof Error ? error.message : "Unknown error",
  });

  return NextResponse.json(
    {
      success: false as const,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 },
  );
}

export async function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    return handleApiError(error);
  }
}
