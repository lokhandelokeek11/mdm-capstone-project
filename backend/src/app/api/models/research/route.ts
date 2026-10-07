import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { researchService } from "@/modules/models/research.service";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    requireAuth(request);
    const results = researchService.getResults();
    if (!results) {
      return successResponse<Record<string, unknown> | null>(null, {
        message: "Run ml/train_models.py to generate research_results.json",
      });
    }
    return successResponse<Record<string, unknown> | null>(results);
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/utils/cors");
  return handleOptions();
}
