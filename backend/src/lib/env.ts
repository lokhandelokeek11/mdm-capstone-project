import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(32).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.parse(process.env);

export const env = {
  DATABASE_URL:
    parsed.DATABASE_URL ??
    "postgresql://cji_user:cji_password@localhost:5432/customer_journey_intelligence",
  JWT_SECRET:
    parsed.JWT_SECRET ??
    "dev-only-jwt-secret-change-in-production-min-32-chars",
  NEXT_PUBLIC_APP_URL: parsed.NEXT_PUBLIC_APP_URL,
  FRONTEND_URL: parsed.FRONTEND_URL,
  NODE_ENV: parsed.NODE_ENV,
};
