import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organization: z.string().min(2, "Organization name is required"),
});

export const customerFilterSchema = z.object({
  stage: z.string().optional(),
  segment: z.string().optional(),
  engagement: z.string().optional(),
  purchasePropensity: z.string().optional(),
  activityDate: z.string().optional(),
  purchaseStatus: z.string().optional(),
});

export const datasetUploadSchema = z.object({
  name: z.string().min(1, "Dataset name is required"),
  description: z.string().optional(),
  sourceType: z.enum(["CSV", "JSON"]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CustomerFilterFormData = z.infer<typeof customerFilterSchema>;
export type DatasetUploadFormData = z.infer<typeof datasetUploadSchema>;
