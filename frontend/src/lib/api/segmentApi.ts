import { apiClient } from "./client";
import type { ApiResponse, Segment } from "@/types";

export const segmentApi = {
  list: async () => {
    const res = await apiClient.get<ApiResponse<Segment[]>>("/segments");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Segment>>(`/segments/${id}`);
    return res.data;
  },
};
