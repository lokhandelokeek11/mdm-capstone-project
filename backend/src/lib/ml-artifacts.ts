import fs from "fs";
import path from "path";

export type CustomerScoreArtifact = {
  visitorId: number;
  journeyStage: string;
  segment: string;
  behaviouralCluster: number;
  propensity: number;
  churnRisk: number;
  nextEvent: string;
  recommendedAction: {
    actionType: string;
    reason: string;
    priority: number;
  };
  productRecommendations: { itemId: number; score: number }[];
  shapFeatures: { feature: string; shap: number }[];
  postPurchased: number;
};

export type ModelMetricArtifact = {
  id: string;
  name: string;
  version: string;
  modelType: string;
  status: string;
  metrics: Record<string, unknown>;
  createdAt: string;
};

let scoresByVisitor: Map<number, CustomerScoreArtifact> | null = null;
let researchCache: Record<string, unknown> | null = null;
let paperFiguresCache: Record<string, unknown> | null = null;
let tableIvCache: Record<string, unknown> | null = null;
let modelMetricsCache: ModelMetricArtifact[] | null = null;

function artifactsDir(): string {
  const fromEnv = process.env.ML_ARTIFACTS_DIR;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  const candidates = [
    path.join(process.cwd(), "data", "artifacts"),
    path.join(process.cwd(), "..", "data", "artifacts"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "research_results.json"))) return dir;
  }
  return candidates[1];
}

function readJson<T>(filename: string): T | null {
  const full = path.join(artifactsDir(), filename);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf-8")) as T;
}

export function getResearchResults(): Record<string, unknown> | null {
  if (!researchCache) {
    researchCache = readJson("research_results.json");
  }
  return researchCache;
}

export function getPaperFigures(): Record<string, unknown> | null {
  if (!paperFiguresCache) {
    paperFiguresCache = readJson("paper_figures.json");
  }
  return paperFiguresCache;
}

export function getTableIvPostCleaning(): Record<string, unknown> | null {
  if (!tableIvCache) {
    tableIvCache = readJson("table_iv_post_cleaning.json");
  }
  return tableIvCache;
}

export function getModelMetricsArtifacts(): ModelMetricArtifact[] {
  if (!modelMetricsCache) {
    modelMetricsCache = readJson("model_metrics.json") ?? [];
  }
  return modelMetricsCache;
}

export function getCustomerScoresMap(): Map<number, CustomerScoreArtifact> {
  if (!scoresByVisitor) {
    const rows = readJson<CustomerScoreArtifact[]>("customer_scores.json") ?? [];
    scoresByVisitor = new Map(rows.map((r) => [r.visitorId, r]));
  }
  return scoresByVisitor;
}

export function getScoreByExternalId(externalId: string): CustomerScoreArtifact | null {
  const vid = Number(externalId);
  if (Number.isNaN(vid)) return null;
  return getCustomerScoresMap().get(vid) ?? null;
}

export function clearArtifactsCache() {
  scoresByVisitor = null;
  researchCache = null;
  modelMetricsCache = null;
  paperFiguresCache = null;
  tableIvCache = null;
}
