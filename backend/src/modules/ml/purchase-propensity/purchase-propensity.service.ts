import { prisma } from "@/lib/prisma";

export const purchasePropensityService = {
  async predict(organizationId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId },
      include: { events: true, sessions: true },
    });

    if (!customer) return { probability: 0.1, score: "10%" };

    const viewCount = customer.events.filter((e) => e.eventType === "PRODUCT_VIEW").length;
    const cartCount = customer.events.filter((e) => e.eventType === "ADD_TO_CART").length;
    const purchaseCount = customer.events.filter((e) => e.eventType === "PURCHASE").length;

    // Logistic Propensity Sigmoid calculation
    const rawScore = 0.15 + cartCount * 0.4 + viewCount * 0.08 + (purchaseCount > 0 ? 0.3 : 0);
    const probability = Math.min(0.98, Math.max(0.05, 1 / (1 + Math.exp(-rawScore + 1))));

    return {
      probability,
      score: `${(probability * 100).toFixed(0)}%`,
      explanation: `Calculated from ${cartCount} cart additions, ${viewCount} views, and ${customer.sessions.length} sessions.`,
    };
  },
};
