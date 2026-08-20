export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const APP_NAME = "JourneyIQ";

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  CUSTOMERS: "/customers",
  JOURNEYS: "/journeys",
  SEGMENTS: "/segments",
  PREDICTIONS: "/intelligence/predictions",
  NEXT_BEST_ACTIONS: "/next-best-actions",
  ANALYTICS: "/analytics",
  ADMIN_DATASETS: "/admin/datasets",
  ADMIN_MODELS: "/admin/models",
} as const;
