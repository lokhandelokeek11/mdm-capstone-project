import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/utils/errors";

export const modelService = {
  async list(organizationId: string) {
    return prisma.modelVersion.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(organizationId: string, id: string) {
    const model = await prisma.modelVersion.findFirst({
      where: { id, organizationId },
    });
    if (!model) throw new NotFoundError("Model not found");
    return model;
  },
};

export const experimentService = {
  async list(organizationId: string) {
    return prisma.strategyExperiment.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { results: true },
    });
  },

  async create(organizationId: string, data: { name: string; description?: string }) {
    return prisma.strategyExperiment.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        status: "DRAFT",
      },
    });
  },
};
