import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { datasetPipelineService } from "@/modules/datasets/dataset-pipeline.service";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { id } = await params;

    const dataset = await prisma.dataset.findFirst({
      where: { id, organizationId: payload.organizationId },
    });

    const filePath = dataset?.filePath || "data/raw/retailrocket/events.csv";
    const report = await datasetPipelineService.validateData(filePath);

    return successResponse(report, { message: "Validation report generated" });
  });
}
