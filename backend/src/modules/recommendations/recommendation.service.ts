import { prisma } from "@/lib/prisma";

export const recommendationService = {
  async list(organizationId: string, skip: number, limit: number) {
    const [actions, total] = await Promise.all([
      prisma.recommendedAction.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      prisma.recommendedAction.count({ where: { organizationId } }),
    ]);
    return { actions, total };
  },

  async getByCustomerId(organizationId: string, customerId: string) {
    return prisma.recommendedAction.findMany({
      where: { organizationId, customerId },
      orderBy: { priority: "desc" },
      include: { customer: true },
    });
  },
};
