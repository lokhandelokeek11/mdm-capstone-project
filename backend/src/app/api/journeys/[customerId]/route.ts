import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { journeyService } from "@/modules/journeys/journey.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { customerId } = await params;
    const journey = await journeyService.getByCustomerId(payload.organizationId, customerId);
    return successResponse(journey);
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/utils/cors");
  return handleOptions();
}
