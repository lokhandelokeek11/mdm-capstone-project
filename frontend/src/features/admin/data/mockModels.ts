import type { Model } from "@/types";

/** Synced from data/artifacts/model_metrics.json after ml/train_models.py */
export const mockModels: Model[] = [
  {
    id: "model_propensity_v1",
    name: "Purchase Propensity (journey-aware champion)",
    modelType: "purchase_propensity",
    version: "3.0.0",
    status: "READY",
    metrics: { accuracy: 0.999, precision: 0.25, recall: 0.0714, f1: 0.1111, roc_auc: 0.9742 },
    createdAt: "2026-10-04T18:12:47.000Z",
  },
  {
    id: "model_segmentation_v1",
    name: "Customer Segmentation v3",
    modelType: "segmentation",
    version: "3.0.0",
    status: "READY",
    metrics: { silhouette: 0.6173, calinski_harabasz: 120868.4, davies_bouldin: 0.4166, clusters: 3 },
    createdAt: "2026-10-04T18:12:47.000Z",
  },
  {
    id: "model_churn_v1",
    name: "Churn & Inactivity Risk v3",
    modelType: "churn_risk",
    version: "3.0.0",
    status: "READY",
    metrics: { accuracy: 0.9929, f1_score: 0.9964, auc: 0.9873, precision: 0.9938, recall: 0.999 },
    createdAt: "2026-10-04T18:12:47.000Z",
  },
  {
    id: "model_next_event_v1",
    name: "Next Event (markov)",
    modelType: "next_event",
    version: "3.0.0",
    status: "READY",
    metrics: { accuracy: 1.0, f1: 0.3333, top3_acc: "100.0%" },
    createdAt: "2026-10-04T18:12:47.000Z",
  },
];
