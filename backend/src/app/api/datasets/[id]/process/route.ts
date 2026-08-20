import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { datasetPipelineService } from "@/modules/datasets/dataset-pipeline.service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { id } = await params;

    const result = await datasetPipelineService.executePipeline(id, payload.organizationId, 10000);

    return successResponse(result, { message: "Dataset pipeline executed successfully" });
  });
}
