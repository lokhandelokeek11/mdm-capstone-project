import { prisma } from "@/lib/prisma";
import { Customer, Prisma } from "@/generated/prisma/client";
import { CustomerFilterInput } from "@/schemas";

export const customerRepository = {
  async findMany(
    organizationId: string,
    filters: CustomerFilterInput,
    skip: number,
    limit: number,
  ) {
    try {
      const where: Prisma.CustomerWhereInput = { organizationId };
      return await prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          customerSegments: { include: { segment: true } },
          features: true,
          predictions: { take: 5, orderBy: { createdAt: "desc" } },
        },
      });
    } catch (error) {
      console.error("customerRepository.findMany DB error:", error);
      return [];
    }
  },

  async count(organizationId: string) {
    try {
      return await prisma.customer.count({ where: { organizationId } });
    } catch (error) {
      console.error("customerRepository.count DB error:", error);
      return 0;
    }
  },

  async findById(organizationId: string, id: string): Promise<Customer | null> {
    try {
      return await prisma.customer.findFirst({
        where: { id, organizationId },
        include: {
          sessions: { orderBy: { startedAt: "desc" }, take: 10 },
          events: { orderBy: { occurredAt: "desc" }, take: 50 },
          customerSegments: { include: { segment: true } },
          features: true,
          predictions: { orderBy: { createdAt: "desc" } },
          recommendedActions: { orderBy: { createdAt: "desc" }, take: 5 },
          productRecommendations: { include: { product: true }, take: 5 },
        },
      });
    } catch (error) {
      console.error("customerRepository.findById DB error:", error);
      return null;
    }
  },
};
