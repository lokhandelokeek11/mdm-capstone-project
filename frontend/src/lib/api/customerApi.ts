import { apiClient } from "./client";
import type { ApiResponse, Customer, CustomerDetail } from "@/types";
import type { CustomerFilterFormData } from "@/schemas";

export const customerApi = {
  list: async (filters?: CustomerFilterFormData) => {
    const res = await apiClient.get<ApiResponse<Customer[]>>("/customers", { params: filters });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<CustomerDetail>>(`/customers/${id}`);
    return res.data;
  },
};
