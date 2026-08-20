import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { requireAuth } from "@/lib/auth";
import { authService } from "@/modules/auth/auth.service";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const payload = requireAuth(request);
    const user = await authService.getMe(payload.userId);
    return successResponse(user);
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
