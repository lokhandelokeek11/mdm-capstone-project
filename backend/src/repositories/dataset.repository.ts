import { prisma } from "@/lib/prisma";
import { DatasetUploadInput } from "@/schemas";

export const datasetRepository = {
  async findMany(organizationId: string, skip: number, limit: number) {
    return prisma.dataset.findMany({
      where: { organizationId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { columns: true },
    });
  },

  async count(organizationId: string) {
    return prisma.dataset.count({ where: { organizationId } });
  },

  async findById(organizationId: string, id: string) {
    return prisma.dataset.findFirst({
      where: { id, organizationId },
      include: { columns: true },
    });
  },

  async create(organizationId: string, data: DatasetUploadInput) {
    return prisma.dataset.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        sourceType: data.sourceType,
        status: "PENDING",
      },
    });
  },

  async delete(organizationId: string, id: string) {
    return prisma.dataset.deleteMany({ where: { id, organizationId } });
  },
};
