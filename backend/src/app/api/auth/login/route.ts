import { NextRequest } from "next/server";
import { successResponse, withErrorHandler } from "@/utils/api-response";
import { authService } from "@/modules/auth/auth.service";
import { loginSchema } from "@/schemas";

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = loginSchema.parse(await request.json());
    const result = await authService.login(body);
    const response = successResponse(result, { message: "Login successful" });
    response.cookies.set("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
