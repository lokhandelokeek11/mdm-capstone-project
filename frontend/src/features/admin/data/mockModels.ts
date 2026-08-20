import type { Model } from "@/types";

export const mockModels: Model[] = [
  {
    id: "m1",
    name: "Purchase Propensity v1",
    modelType: "purchase_propensity",
    version: "1.2.0",
    status: "READY",
    metrics: { accuracy: "100.0%", auc: 1.0, precision: 0.91 },
    createdAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "m2",
    name: "Customer Segmentation v1",
    modelType: "segmentation",
    version: "2.0.0",
    status: "READY",
    metrics: { silhouette: 0.8934, clusters: 4 },
    createdAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "m3",
    name: "Churn & Inactivity Risk v1",
    modelType: "churn_risk",
    version: "1.1.0",
    status: "READY",
    metrics: { accuracy: "91.5%", f1_score: 0.884, auc: 0.932 },
    createdAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "m4",
    name: "Next Event Prediction v1",
    modelType: "next_event",
    version: "1.0.0",
    status: "READY",
    metrics: { accuracy: "89.5%", top3_acc: "96.2%" },
    createdAt: "2026-08-20T10:00:00Z",
  },
];

