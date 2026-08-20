export type UserRole = "ADMIN" | "MARKETING_ANALYST" | "MARKETING_MANAGER";

export type EventType =
  | "PRODUCT_VIEW"
  | "SEARCH"
  | "CLICK"
  | "FAVORITE"
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "PURCHASE"
  | "EMAIL_CLICK"
  | "AD_CLICK"
  | "SESSION_START"
  | "SESSION_END";

export type JourneyStageType =
  | "AWARENESS"
  | "CONSIDERATION"
  | "INTENT"
  | "PURCHASE"
  | "RETENTION"
  | "CHURN_RISK"
  | "INACTIVE";

export type RecommendedActionType =
  | "WAIT"
  | "PRODUCT_RECOMMENDATION"
  | "CART_REMINDER"
  | "PERSONALIZED_EMAIL"
  | "RETARGETING"
  | "DISCOUNT"
  | "CROSS_SELL"
  | "RE_ENGAGEMENT"
  | "STOP_MARKETING";

export type PurchaseStatus = "PURCHASED" | "NOT_PURCHASED" | "CART_ABANDONED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
}

export interface Customer {
  id: string;
  externalId: string;
  journeyStage: JourneyStageType | string;
  engagementScore: number;
  purchasePropensity: number;
  segment: string;
  lastActivity: string;
  purchaseStatus: PurchaseStatus;
  name?: string;
  email?: string;
}

export interface CustomerDetail extends Customer {
  sessions: number;
  views: number;
  cartAdditions: number;
  purchases: number;
  uniqueProducts: number;
  predictedNextEvent: EventType | string;
  recommendedAction: RecommendedActionType | string;
  recommendationReasons: string[];
  journeyEvents: JourneyEvent[];
  insights: string[];
}

export interface Session {
  id: string;
  customerId: string;
  startedAt: string;
  endedAt?: string;
  eventCount: number;
}

export interface Event {
  id: string;
  customerId: string;
  sessionId?: string;
  eventType: EventType;
  productId?: string;
  productName?: string;
  occurredAt: string;
}

export interface Journey {
  customerId: string;
  externalId: string;
  sessionCount: number;
  eventCount: number;
  firstInteraction: string;
  lastInteraction: string;
  journeyDuration: string;
  events: JourneyEvent[];
}

export interface JourneyEvent {
  id: string;
  eventType: EventType | string;
  label: string;
  occurredAt: string;
  productName?: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  isActive: boolean;
}

export interface Prediction {
  id: string;
  customerId: string;
  customerName?: string;
  predictionType: string;
  predictedValue: string | number;
  confidence: number;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  customerId: string;
  customerName?: string;
  actionType: RecommendedActionType | string;
  reason: string;
  priority: number;
  createdAt: string;
}

export interface NextBestAction {
  id: string;
  customerId: string;
  actionType: RecommendedActionType;
  reason: string;
  priority: number;
}

export interface AnalyticsMetric {
  label: string;
  value: number;
  change?: number;
  format?: "number" | "percent";
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  sourceType: string;
  status: "PENDING" | "PROCESSING" | "READY" | "FAILED";
  rowCount: number;
  createdAt: string;
}

export interface Model {
  id: string;
  name: string;
  modelType: string;
  version: string;
  status: string;
  metrics?: Record<string, number | string>;
  createdAt: string;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
