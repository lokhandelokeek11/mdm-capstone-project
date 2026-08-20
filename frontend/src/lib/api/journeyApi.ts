import { apiClient } from "./client";
import type { ApiResponse, Journey } from "@/types";

export const journeyApi = {
  list: async () => {
    const res = await apiClient.get<ApiResponse<Journey[]>>("/journeys");
    return res.data;
  },
  getByCustomerId: async (customerId: string) => {
    const res = await apiClient.get<ApiResponse<Journey>>(`/journeys/${customerId}`);
    return res.data;
  },
};
