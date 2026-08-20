import { successResponse, withErrorHandler } from "@/utils/api-response";

export async function POST() {
  return withErrorHandler(async () => {
    const response = successResponse(null, { message: "Logged out successfully" });
    response.cookies.delete("auth_token");
    return response;
  });
}

export async function OPTIONS() {
  const { handleOptions } = await import("@/middleware");
  return handleOptions();
}
