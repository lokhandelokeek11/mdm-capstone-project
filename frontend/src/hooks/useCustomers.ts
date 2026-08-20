import { useQuery } from "@tanstack/react-query";
import { mockCustomers } from "@/features/customers/data/mockCustomers";
import type { CustomerFilterFormData } from "@/schemas";

const USE_MOCK = true;

export function useCustomers(filters?: CustomerFilterFormData) {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: async () => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        return { data: mockCustomers, pagination: { page: 1, limit: 20, total: mockCustomers.length } };
      }
      const { customerApi } = await import("@/lib/api/customerApi");
      return customerApi.list(filters);
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        const { getMockCustomerById } = await import("@/features/customers/data/mockCustomers");
        const customer = getMockCustomerById(id);
        if (!customer) throw new Error("Customer not found");
        return { data: customer };
      }
      const { customerApi } = await import("@/lib/api/customerApi");
      return customerApi.getById(id);
    },
    enabled: !!id,
  });
}
