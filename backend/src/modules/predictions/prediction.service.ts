import { prisma } from "@/lib/prisma";

export const predictionService = {
  async list(organizationId: string, skip: number, limit: number) {
    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { customer: true, modelVersion: true },
      }),
      prisma.prediction.count({ where: { organizationId } }),
    ]);
    return { predictions, total };
  },

  async getByCustomerId(organizationId: string, customerId: string) {
    return prisma.prediction.findMany({
      where: { organizationId, customerId },
      orderBy: { createdAt: "desc" },
      include: { modelVersion: true },
    });
  },
};
