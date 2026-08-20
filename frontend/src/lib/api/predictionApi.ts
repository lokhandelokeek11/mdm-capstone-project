import { apiClient } from "./client";
import type { ApiResponse, Prediction } from "@/types";

export const predictionApi = {
  list: async () => {
    const res = await apiClient.get<ApiResponse<Prediction[]>>("/predictions");
    return res.data;
  },
  getByCustomerId: async (customerId: string) => {
    const res = await apiClient.get<ApiResponse<Prediction[]>>(`/predictions/${customerId}`);
    return res.data;
  },
};
