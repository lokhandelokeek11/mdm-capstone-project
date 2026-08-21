import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": env.FRONTEND_URL || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function handleOptions() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
