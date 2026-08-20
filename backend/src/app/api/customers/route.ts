import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { customerService } from "@/modules/customers/customer.service";
import { customerFilterSchema } from "@/schemas";
import { parsePagination, paginationMeta } from "@/utils/pagination";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const filters = customerFilterSchema.parse(Object.fromEntries(searchParams));
    const { page, limit, skip } = parsePagination(searchParams);
    const { customers, total } = await customerService.list(
      payload.organizationId,
      filters,
      skip,
      limit,
    );
    return successResponse(customers, { pagination: paginationMeta(page, limit, total) });
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
