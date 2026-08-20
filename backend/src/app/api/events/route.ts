import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { eventService } from "@/modules/events/event.service";
import { eventIngestionSchema } from "@/schemas";
import { parsePagination } from "@/utils/pagination";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const { skip, limit } = parsePagination(searchParams);
    const events = await eventService.list(payload.organizationId, skip, limit);
    return successResponse(events);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const body = eventIngestionSchema.parse(await request.json());
    const event = await eventService.ingest(payload.organizationId, body);
    return successResponse(event, { message: "Event ingested", status: 201 });
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
