import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { analyticsService } from "@/modules/analytics/analytics.service";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const segments = await analyticsService.getSegmentAnalytics(payload.organizationId);
    return successResponse(segments);
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/utils/cors");
  return handleOptions();
}
