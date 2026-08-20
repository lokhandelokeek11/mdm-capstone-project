import { customerRepository } from "@/repositories/customer.repository";
import { NotFoundError } from "@/utils/errors";
import { CustomerFilterInput } from "@/schemas";

export const customerService = {
  async list(organizationId: string, filters: CustomerFilterInput, skip: number, limit: number) {
    const [customers, total] = await Promise.all([
      customerRepository.findMany(organizationId, filters, skip, limit),
      customerRepository.count(organizationId),
    ]);
    return { customers, total };
  },

  async getById(organizationId: string, id: string) {
    const customer = await customerRepository.findById(organizationId, id);
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }
    return customer;
  },
};
