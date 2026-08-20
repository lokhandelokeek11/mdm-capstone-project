import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { authService } from "@/modules/auth/auth.service";
import { registerSchema, loginSchema } from "@/schemas";

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = registerSchema.parse(await request.json());
    const result = await authService.register(body);
    return successResponse(result, { message: "Registration successful", status: 201 });
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
