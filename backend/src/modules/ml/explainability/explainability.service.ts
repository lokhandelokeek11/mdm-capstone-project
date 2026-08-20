import { prisma } from "@/lib/prisma";

export const explainabilityService = {
  async explainCustomerScoring(organizationId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId },
      include: { events: true, features: true },
    });

    if (!customer) return { explanations: ["Customer profile not initialized."] };

    const viewCount = customer.events.filter((e) => e.eventType === "PRODUCT_VIEW").length;
    const cartCount = customer.events.filter((e) => e.eventType === "ADD_TO_CART").length;
    const purchaseCount = customer.events.filter((e) => e.eventType === "PURCHASE").length;

    const explanations: string[] = [
      `Recorded ${viewCount} product views and ${cartCount} cart additions across sessions.`,
      cartCount > 0 && purchaseCount === 0
        ? "Cart abandonment detected: High propensity item retained in active cart."
        : "Regular browsing engagement pattern.",
      purchaseCount > 0 ? `Customer completed ${purchaseCount} historical purchases.` : "No completed purchases yet.",
    ];

    return { customerId, explanations };
  },
};
