import type { Prediction } from "@/types";

export const mockPredictions: Prediction[] = [
  { id: "p1", customerId: "82931", customerName: "Customer 82931", predictionType: "Purchase Propensity", predictedValue: "78%", confidence: 0.85, createdAt: "2026-08-20T10:00:00Z" },
  { id: "p2", customerId: "82932", customerName: "Customer 82932", predictionType: "Next Event", predictedValue: "PURCHASE", confidence: 0.72, createdAt: "2026-08-19T15:00:00Z" },
  { id: "p3", customerId: "82934", customerName: "Customer 82934", predictionType: "Purchase Propensity", predictedValue: "72%", confidence: 0.78, createdAt: "2026-08-20T08:00:00Z" },
  { id: "p4", customerId: "82935", customerName: "Customer 82935", predictionType: "Churn Risk", predictedValue: "65%", confidence: 0.81, createdAt: "2026-08-18T12:00:00Z" },
  { id: "p5", customerId: "82938", customerName: "Customer 82938", predictionType: "Next Event", predictedValue: "ADD_TO_CART", confidence: 0.69, createdAt: "2026-08-20T07:00:00Z" },
];
