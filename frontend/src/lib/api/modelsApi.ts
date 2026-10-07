import { apiClient } from "./client";
import type { ApiResponse, Model } from "@/types";

export type ResearchResults = Record<string, unknown>;

export const modelsApi = {
  list: async () => {
    const res = await apiClient.get<ApiResponse<Model[]>>("/models");
    return res.data;
  },
  research: async () => {
    const res = await apiClient.get<ApiResponse<ResearchResults | null>>("/models/research");
    return res.data;
  },
  paperFigures: async () => {
    const res = await apiClient.get<
      ApiResponse<{ paperFigures: ResearchResults | null; tableIvPostCleaning: ResearchResults | null }>
    >("/models/paper-figures");
    return res.data;
  },
};
