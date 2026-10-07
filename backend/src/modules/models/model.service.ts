import { prisma } from "@/lib/prisma";
import { getModelMetricsArtifacts } from "@/lib/ml-artifacts";
import { NotFoundError } from "@/utils/errors";
import { ModelStatus } from "@/generated/prisma/client";

export const modelService = {
  async list(organizationId: string) {
    const dbModels = await prisma.modelVersion.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    if (dbModels.length > 0) return dbModels;

    return getModelMetricsArtifacts().map((m) => ({
      id: m.id,
      organizationId,
      name: m.name,
      modelType: m.modelType,
      version: m.version,
      status: (m.status as ModelStatus) ?? ModelStatus.READY,
      metrics: m.metrics,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
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
    const db = await prisma.strategyExperiment.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { results: true },
    });
    if (db.length > 0) return db;

    const { getResearchResults } = await import("@/lib/ml-artifacts");
    const research = getResearchResults() as { RQ4_strategy_simulation?: Record<string, unknown> } | null;
    const rq4 = research?.RQ4_strategy_simulation;
    if (!rq4) return [];

    const results = Object.entries(rq4)
      .filter(([key]) => !["winner", "disclaimer"].includes(key))
      .flatMap(([variant, metrics]) => {
        const m = metrics as Record<string, number>;
        return [
          { metricName: "targeting_precision", metricValue: m.targeting_precision ?? 0, variant },
          { metricName: "coverage", metricValue: m.coverage ?? 0, variant },
          { metricName: "unnecessary_interventions", metricValue: m.unnecessary_interventions ?? 0, variant },
        ];
      });

    return [
      {
        id: "rq4-offline-simulation",
        organizationId,
        name: "RQ4: Generic vs Segment vs Journey Intelligence",
        description: "Offline simulated strategy comparison on RetailRocket holdout visitors.",
        status: "COMPLETED" as const,
        config: { winner: rq4.winner, disclaimer: "Offline proxy metrics; not causal lift." },
        startedAt: new Date(),
        endedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        results,
      },
    ];
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
