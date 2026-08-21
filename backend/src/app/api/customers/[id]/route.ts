import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { customerService } from "@/modules/customers/customer.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { id } = await params;
    const customer = await customerService.getById(payload.organizationId, id);
    return successResponse(customer);
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/utils/cors");
  return handleOptions();
}
