import { prisma } from "@/lib/prisma";
import { RecommendedActionType } from "@/generated/prisma";

export const recommendationService = {
  async getNextBestAction(organizationId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId },
      include: { events: true },
    });

    if (!customer) {
      return { actionType: "PERSONALIZED_EMAIL" as RecommendedActionType, reason: "Default engagement campaign." };
    }

    const cartCount = customer.events.filter((e) => e.eventType === "ADD_TO_CART").length;
    const purchaseCount = customer.events.filter((e) => e.eventType === "PURCHASE").length;

    let actionType: RecommendedActionType = "PERSONALIZED_EMAIL";
    let reason = "Engaged user with high browsing interest.";

    if (cartCount > 0 && purchaseCount === 0) {
      actionType = "CART_REMINDER";
      reason = "Customer added items to cart without purchase. High intent cart abandonment detected.";
    } else if (purchaseCount > 3) {
      actionType = "DISCOUNT";
      reason = "High-value loyal customer eligible for VIP discount incentive.";
    }

    return { actionType, reason, priority: 1 };
  },
};
