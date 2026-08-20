import { apiClient } from "./client";
import type { ApiResponse, Dataset } from "@/types";
import type { DatasetUploadFormData } from "@/schemas";

export const datasetApi = {
  list: async () => {
    const res = await apiClient.get<ApiResponse<Dataset[]>>("/datasets");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Dataset>>(`/datasets/${id}`);
    return res.data;
  },
  create: async (data: DatasetUploadFormData) => {
    const res = await apiClient.post<ApiResponse<Dataset>>("/datasets", data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/datasets/${id}`);
    return res.data;
  },
};
