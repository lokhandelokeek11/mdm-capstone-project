import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { modelService } from "@/modules/models/model.service";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const models = await modelService.list(payload.organizationId);
    return successResponse(models);
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/utils/cors");
  return handleOptions();
}
