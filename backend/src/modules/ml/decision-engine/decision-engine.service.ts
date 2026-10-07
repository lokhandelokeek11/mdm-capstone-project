import { RecommendedActionType } from "@/generated/prisma/client";

export type DecisionInput = {
  stage: string;
  segment: string;
  propensity: number;
  churnRisk: number;
  carts: number;
  purchasesPre: number;
  recencyDays: number;
  nextEvent?: string | null;
};

export type DecisionOutput = {
  actionType: RecommendedActionType;
  reason: string;
  priority: number;
};

export function decideNextBestAction(input: DecisionInput): DecisionOutput {
  const {
    stage,
    segment,
    propensity,
    churnRisk,
    carts,
    purchasesPre,
    recencyDays,
    nextEvent,
  } = input;

  if (purchasesPre > 0 && recencyDays <= 7) {
    return {
      actionType: RecommendedActionType.WAIT,
      reason: "Recent purchase detected; suppress promotional noise.",
      priority: 2,
    };
  }
  if (purchasesPre > 0 && recencyDays <= 30) {
    return {
      actionType: RecommendedActionType.STOP_MARKETING,
      reason: "Customer in post-purchase cooling period.",
      priority: 3,
    };
  }
  if (carts > 0 && purchasesPre === 0) {
    return {
      actionType: RecommendedActionType.CART_REMINDER,
      reason: `Cart abandonment with ${(propensity * 100).toFixed(0)}% purchase propensity.`,
      priority: 10,
    };
  }
  if (propensity >= 0.7 && carts === 0) {
    return {
      actionType: RecommendedActionType.DISCOUNT,
      reason: `High intent (propensity ${(propensity * 100).toFixed(0)}%) without cart conversion.`,
      priority: 9,
    };
  }
  if (
    (stage === "HIGH_INTENT" || stage === "CONSIDERATION") &&
    nextEvent === "addtocart"
  ) {
    return {
      actionType: RecommendedActionType.PRODUCT_RECOMMENDATION,
      reason: "Sequence model predicts cart addition; recommend complementary items.",
      priority: 8,
    };
  }
  if (churnRisk >= 0.6 || stage === "INACTIVE" || recencyDays > 14) {
    return {
      actionType: RecommendedActionType.RE_ENGAGEMENT,
      reason: `Inactivity/churn risk ${(churnRisk * 100).toFixed(0)}%.`,
      priority: 7,
    };
  }
  if (propensity < 0.25 && segment === "Recent Browsers") {
    return {
      actionType: RecommendedActionType.WAIT,
      reason: "Low propensity browser; wait for stronger intent signals.",
      priority: 1,
    };
  }
  return {
    actionType: RecommendedActionType.PERSONALIZED_EMAIL,
    reason: "Engaged browsing pattern; nurture with personalized content.",
    priority: 5,
  };
}

export function segmentOnlyAction(segment: string): RecommendedActionType {
  const mapping: Record<string, RecommendedActionType> = {
    "Cart Abandoners": RecommendedActionType.CART_REMINDER,
    "Champions & High Value": RecommendedActionType.CROSS_SELL,
    "At-Risk / Inactive": RecommendedActionType.RE_ENGAGEMENT,
    "High Intent Cohort": RecommendedActionType.DISCOUNT,
    "Recent Browsers": RecommendedActionType.PERSONALIZED_EMAIL,
  };
  return mapping[segment] ?? RecommendedActionType.PERSONALIZED_EMAIL;
}
