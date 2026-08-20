import { apiClient } from "./client";
import type { ApiResponse, Recommendation } from "@/types";

export const recommendationApi = {
  list: async () => {
    const res = await apiClient.get<ApiResponse<Recommendation[]>>("/recommendations");
    return res.data;
  },
  getByCustomerId: async (customerId: string) => {
    const res = await apiClient.get<ApiResponse<Recommendation[]>>(
      `/recommendations/${customerId}`,
    );
    return res.data;
  },
};
