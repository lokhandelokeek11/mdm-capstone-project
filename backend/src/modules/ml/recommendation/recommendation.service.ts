import { prisma } from "@/lib/prisma";
import { getScoreByExternalId } from "@/lib/ml-artifacts";
import { decideNextBestAction } from "@/modules/ml/decision-engine/decision-engine.service";
import { RecommendedActionType } from "@/generated/prisma/client";

export const recommendationService = {
  async getNextBestAction(organizationId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId },
      include: { events: true },
    });

    if (!customer) {
      return { actionType: "PERSONALIZED_EMAIL" as RecommendedActionType, reason: "Default engagement campaign." };
    }

    if (customer.externalId) {
      const artifact = getScoreByExternalId(customer.externalId);
      if (artifact) {
        return {
          actionType: artifact.recommendedAction.actionType as RecommendedActionType,
          reason: artifact.recommendedAction.reason,
          priority: artifact.recommendedAction.priority,
        };
      }
    }

    const cartCount = customer.events.filter((e) => e.eventType === "ADD_TO_CART").length;
    const purchaseCount = customer.events.filter((e) => e.eventType === "PURCHASE").length;
    const viewCount = customer.events.filter((e) => e.eventType === "PRODUCT_VIEW").length;
    const lastEvent = customer.events.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())[0];
    const recencyDays = lastEvent
      ? Math.floor((Date.now() - lastEvent.occurredAt.getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    const decision = decideNextBestAction({
      stage: "CONSIDERATION",
      segment: "Recent Browsers",
      propensity: Math.min(0.98, 0.15 + cartCount * 0.35 + viewCount * 0.05),
      churnRisk: Math.min(0.99, recencyDays * 0.03),
      carts: cartCount,
      purchasesPre: purchaseCount,
      recencyDays,
      nextEvent: null,
    });

    return decision;
  },
};
