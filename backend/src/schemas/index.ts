import { z } from "zod";
import { UserRole } from "@/generated/prisma/client";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  organization: z.string().min(2).max(100),
  role: z.nativeEnum(UserRole).optional().default(UserRole.MARKETING_ANALYST),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const customerFilterSchema = z.object({
  stage: z.string().optional(),
  segment: z.string().optional(),
  engagement: z.string().optional(),
  purchasePropensity: z.string().optional(),
  activityDate: z.string().optional(),
  purchaseStatus: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const datasetUploadSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  sourceType: z.enum(["CSV", "JSON", "REST_API", "WEB_TRACKING", "EXTERNAL"]).default("CSV"),
});

export const eventIngestionSchema = z.object({
  customerId: z.string().min(1),
  sessionId: z.string().optional(),
  eventType: z.enum([
    "PRODUCT_VIEW",
    "SEARCH",
    "CLICK",
    "FAVORITE",
    "ADD_TO_CART",
    "REMOVE_FROM_CART",
    "PURCHASE",
    "EMAIL_CLICK",
    "AD_CLICK",
    "SESSION_START",
    "SESSION_END",
  ]),
  productId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  occurredAt: z.string().datetime().optional(),
});

export const segmentFilterSchema = z.object({
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const recommendationFilterSchema = z.object({
  customerId: z.string().optional(),
  actionType: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;
export type DatasetUploadInput = z.infer<typeof datasetUploadSchema>;
export type EventIngestionInput = z.infer<typeof eventIngestionSchema>;
