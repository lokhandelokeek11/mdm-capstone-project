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
    const where: Prisma.CustomerWhereInput = { organizationId };
    return prisma.customer.findMany({
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
  },

  async count(organizationId: string) {
    return prisma.customer.count({ where: { organizationId } });
  },

  async findById(organizationId: string, id: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
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
  },
};
