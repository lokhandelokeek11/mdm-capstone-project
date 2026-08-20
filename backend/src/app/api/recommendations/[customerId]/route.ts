import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { recommendationService } from "@/modules/recommendations/recommendation.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { customerId } = await params;
    const recommendations = await recommendationService.getByCustomerId(
      payload.organizationId,
      customerId,
    );
    return successResponse(recommendations);
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
