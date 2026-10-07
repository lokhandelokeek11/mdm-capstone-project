/**
 * Upserts ML training outputs into PostgreSQL (ModelVersion, StrategyExperiment, sample customers).
 * Run after: python ml/train_models.py
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient, ModelStatus, ExperimentStatus, PredictionType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function artifactsDir(): string {
  const candidates = [
    path.join(process.cwd(), "data", "artifacts"),
    path.join(process.cwd(), "..", "data", "artifacts"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "research_results.json"))) return dir;
  }
  throw new Error("data/artifacts/research_results.json not found. Run ml/train_models.py first.");
}

async function main() {
  const dir = artifactsDir();
  const modelMetrics = JSON.parse(fs.readFileSync(path.join(dir, "model_metrics.json"), "utf-8"));
  const research = JSON.parse(fs.readFileSync(path.join(dir, "research_results.json"), "utf-8"));
  const scores = JSON.parse(fs.readFileSync(path.join(dir, "customer_scores.json"), "utf-8"));

  const org = await prisma.organization.findFirst({ where: { slug: "demo-retail-co" } });
  if (!org) throw new Error("Seed organization demo-retail-co not found. Run db:seed first.");

  for (const m of modelMetrics) {
    await prisma.modelVersion.upsert({
      where: { id: m.id },
      create: {
        id: m.id,
        organizationId: org.id,
        name: m.name,
        modelType: m.modelType,
        version: m.version,
        status: ModelStatus.READY,
        metrics: m.metrics,
      },
      update: {
        name: m.name,
        version: m.version,
        status: ModelStatus.READY,
        metrics: m.metrics,
      },
    });
  }

  const expId = "rq4-strategy-comparison";
  await prisma.strategyExperiment.upsert({
    where: { id: expId },
    create: {
      id: expId,
      organizationId: org.id,
      name: "RQ4: Generic vs Segment vs Journey Intelligence",
      description: "Offline simulated strategy comparison (synopsis RQ4).",
      status: ExperimentStatus.COMPLETED,
      config: research.RQ4_strategy_simulation,
      startedAt: new Date(),
      endedAt: new Date(),
    },
    update: {
      status: ExperimentStatus.COMPLETED,
      config: research.RQ4_strategy_simulation,
      endedAt: new Date(),
    },
  });

  await prisma.experimentResult.deleteMany({ where: { experimentId: expId } });
  const rq4 = research.RQ4_strategy_simulation as Record<string, Record<string, number>>;
  for (const [variant, metrics] of Object.entries(rq4)) {
    if (variant === "winner") continue;
    if (typeof metrics !== "object") continue;
    for (const [metricName, metricValue] of Object.entries(metrics)) {
      if (typeof metricValue !== "number") continue;
      await prisma.experimentResult.create({
        data: { experimentId: expId, metricName, metricValue, variant },
      });
    }
  }

  const sample = scores.slice(0, 50);
  for (const row of sample) {
    const externalId = String(row.visitorId);
    const customer = await prisma.customer.upsert({
      where: { organizationId_externalId: { organizationId: org.id, externalId } },
      create: {
        organizationId: org.id,
        externalId,
        name: `Visitor ${externalId}`,
        email: `visitor_${externalId}@retailrocket.demo`,
      },
      update: { updatedAt: new Date() },
    });

    await prisma.customerFeature.upsert({
      where: { customerId_featureKey: { customerId: customer.id, featureKey: "ml_journey_intelligence" } },
      create: {
        organizationId: org.id,
        customerId: customer.id,
        featureKey: "ml_journey_intelligence",
        featureValue: {
          journeyStage: row.journeyStage,
          segment: row.segment,
          propensity: row.propensity,
          churnRisk: row.churnRisk,
          nextEvent: row.nextEvent,
          shapFeatures: row.shapFeatures,
        },
      },
      update: {
        featureValue: {
          journeyStage: row.journeyStage,
          segment: row.segment,
          propensity: row.propensity,
          churnRisk: row.churnRisk,
          nextEvent: row.nextEvent,
          shapFeatures: row.shapFeatures,
        },
      },
    });

    await prisma.prediction.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        modelVersionId: "model_propensity_v1",
        predictionType: PredictionType.PURCHASE_PROPENSITY,
        predictedValue: `${(row.propensity * 100).toFixed(0)}%`,
        confidence: row.propensity,
      },
    });

    await prisma.recommendedAction.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        actionType: row.recommendedAction.actionType,
        reason: row.recommendedAction.reason,
        priority: row.recommendedAction.priority,
      },
    });
  }

  console.log(`Imported ${modelMetrics.length} models, RQ4 experiment, and ${sample.length} scored customers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
