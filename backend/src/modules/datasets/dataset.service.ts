import { datasetRepository } from "@/repositories/dataset.repository";
import { NotFoundError } from "@/utils/errors";
import { DatasetUploadInput } from "@/schemas";

export const datasetService = {
  async list(organizationId: string, skip: number, limit: number) {
    const [datasets, total] = await Promise.all([
      datasetRepository.findMany(organizationId, skip, limit),
      datasetRepository.count(organizationId),
    ]);
    return { datasets, total };
  },

  async getById(organizationId: string, id: string) {
    const dataset = await datasetRepository.findById(organizationId, id);
    if (!dataset) {
      throw new NotFoundError("Dataset not found");
    }
    return dataset;
  },

  async create(organizationId: string, data: DatasetUploadInput) {
    return datasetRepository.create(organizationId, data);
  },

  async delete(organizationId: string, id: string) {
    const result = await datasetRepository.delete(organizationId, id);
    if (result.count === 0) {
      throw new NotFoundError("Dataset not found");
    }
  },
};
