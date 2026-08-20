import { apiClient } from "./client";
import type { ApiResponse } from "@/types";

export const analyticsApi = {
  overview: async () => {
    const res = await apiClient.get<ApiResponse<Record<string, number>>>("/analytics/overview");
    return res.data;
  },
  funnel: async () => {
    const res = await apiClient.get<ApiResponse<unknown[]>>("/analytics/funnel");
    return res.data;
  },
  segments: async () => {
    const res = await apiClient.get<ApiResponse<unknown[]>>("/analytics/segments");
    return res.data;
  },
  products: async () => {
    const res = await apiClient.get<ApiResponse<unknown[]>>("/analytics/products");
    return res.data;
  },
};
