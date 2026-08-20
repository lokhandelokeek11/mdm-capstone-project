import type { UserRole } from "@/types";

export type Permission =
  | "dashboard"
  | "customers"
  | "journeys"
  | "segments"
  | "intelligence"
  | "recommendations"
  | "analytics"
  | "experiments"
  | "datasets"
  | "models"
  | "users"
  | "configuration";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "dashboard",
    "customers",
    "journeys",
    "segments",
    "intelligence",
    "recommendations",
    "analytics",
    "experiments",
    "datasets",
    "models",
    "users",
    "configuration",
  ],
  MARKETING_ANALYST: [
    "customers",
    "journeys",
    "segments",
    "intelligence",
    "recommendations",
    "analytics",
    "experiments",
  ],
  MARKETING_MANAGER: [
    "dashboard",
    "customers",
    "journeys",
    "intelligence",
    "recommendations",
    "analytics",
    "experiments",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
