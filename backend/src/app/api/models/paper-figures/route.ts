import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { researchService } from "@/modules/models/research.service";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    requireAuth(request);
    return successResponse({
      paperFigures: researchService.getPaperFigures(),
      tableIvPostCleaning: researchService.getTableIv(),
    });
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/utils/cors");
  return handleOptions();
}
