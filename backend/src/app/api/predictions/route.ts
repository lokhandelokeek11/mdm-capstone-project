import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { predictionService } from "@/modules/predictions/prediction.service";
import { parsePagination, paginationMeta } from "@/utils/pagination";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const { predictions, total } = await predictionService.list(
      payload.organizationId,
      skip,
      limit,
    );
    return successResponse(predictions, { pagination: paginationMeta(page, limit, total) });
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
