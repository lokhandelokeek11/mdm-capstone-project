import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { journeyService } from "@/modules/journeys/journey.service";
import { parsePagination } from "@/utils/pagination";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const { skip, limit } = parsePagination(searchParams);
    const journeys = await journeyService.list(payload.organizationId, skip, limit);
    return successResponse(journeys);
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
