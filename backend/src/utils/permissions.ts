import { UserRole } from "@/generated/prisma/client";

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

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Role ${role} does not have permission: ${permission}`);
  }
}

export { ROLE_PERMISSIONS };
