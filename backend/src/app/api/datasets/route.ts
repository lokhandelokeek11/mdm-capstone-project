import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { datasetService } from "@/modules/datasets/dataset.service";
import { datasetUploadSchema } from "@/schemas";
import { parsePagination, paginationMeta } from "@/utils/pagination";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const { datasets, total } = await datasetService.list(payload.organizationId, skip, limit);
    return successResponse(datasets, { pagination: paginationMeta(page, limit, total) });
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const body = datasetUploadSchema.parse(await request.json());
    const dataset = await datasetService.create(payload.organizationId, body);
    return successResponse(dataset, { message: "Dataset created", status: 201 });
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
