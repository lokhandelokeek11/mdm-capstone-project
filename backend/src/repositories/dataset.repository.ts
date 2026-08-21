import { prisma } from "@/lib/prisma";
import { DatasetUploadInput } from "@/schemas";

export const datasetRepository = {
  async findMany(organizationId: string, skip: number, limit: number) {
    try {
      return await prisma.dataset.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { columns: true },
      });
    } catch (error) {
      console.error("datasetRepository.findMany DB error:", error);
      return [];
    }
  },

  async count(organizationId: string) {
    try {
      return await prisma.dataset.count({ where: { organizationId } });
    } catch (error) {
      console.error("datasetRepository.count DB error:", error);
      return 0;
    }
  },

  async findById(organizationId: string, id: string) {
    try {
      return await prisma.dataset.findFirst({
        where: { id, organizationId },
        include: { columns: true },
      });
    } catch (error) {
      console.error("datasetRepository.findById DB error:", error);
      return null;
    }
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
