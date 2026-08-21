import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { predictionService } from "@/modules/predictions/prediction.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { customerId } = await params;
    const predictions = await predictionService.getByCustomerId(
      payload.organizationId,
      customerId,
    );
    return successResponse(predictions);
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/utils/cors");
  return handleOptions();
}
