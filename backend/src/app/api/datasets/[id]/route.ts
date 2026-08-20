import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { datasetService } from "@/modules/datasets/dataset.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { id } = await params;
    const dataset = await datasetService.getById(payload.organizationId, id);
    return successResponse(dataset);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { id } = await params;
    await datasetService.delete(payload.organizationId, id);
    return successResponse(null, { message: "Dataset deleted" });
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
