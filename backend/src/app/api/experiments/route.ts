import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { experimentService } from "@/modules/models/model.service";

const createExperimentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const experiments = await experimentService.list(payload.organizationId);
    return successResponse(experiments);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const body = createExperimentSchema.parse(await request.json());
    const experiment = await experimentService.create(payload.organizationId, body);
    return successResponse(experiment, { message: "Experiment created", status: 201 });
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/utils/cors");
  return handleOptions();
}
