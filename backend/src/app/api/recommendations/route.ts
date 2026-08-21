import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { recommendationService } from "@/modules/recommendations/recommendation.service";
import { parsePagination, paginationMeta } from "@/utils/pagination";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const { actions, total } = await recommendationService.list(
      payload.organizationId,
      skip,
      limit,
    );
    return successResponse(actions, { pagination: paginationMeta(page, limit, total) });
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/utils/cors");
  return handleOptions();
}
