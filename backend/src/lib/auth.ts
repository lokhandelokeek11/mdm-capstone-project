import { NextRequest } from "next/server";
import { verifyToken, getTokenFromHeader, JwtPayload } from "./jwt";
import { UnauthorizedError } from "@/utils/errors";

export function getAuthPayload(request: NextRequest): JwtPayload | null {
  const token =
    getTokenFromHeader(request.headers.get("authorization")) ??
    request.cookies.get("auth_token")?.value ??
    null;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(request: NextRequest): JwtPayload {
  const payload = getAuthPayload(request);
  if (!payload) {
    throw new UnauthorizedError("Authentication required");
  }
  return payload;
}

export type { JwtPayload };
