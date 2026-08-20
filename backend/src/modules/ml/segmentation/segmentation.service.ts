import { prisma } from "@/lib/prisma";

export interface SegmentationResult {
  customerId: string;
  segmentName: string;
  score: number;
  rfmMetrics: {
    recency: number;
    frequency: number;
    monetary: number;
  };
}

export const segmentationService = {
  async train(organizationId: string) {
    const customers = await prisma.customer.findMany({
      where: { organizationId },
      include: { events: true, transactions: true, sessions: true },
    });

    for (const customer of customers) {
      const viewCount = customer.events.filter((e) => e.eventType === "PRODUCT_VIEW").length;
      const cartCount = customer.events.filter((e) => e.eventType === "ADD_TO_CART").length;
      const purchaseCount = customer.events.filter((e) => e.eventType === "PURCHASE").length;
      const totalAmount = customer.transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

      let segmentName = "Recent Browsers";
      if (purchaseCount > 0 || totalAmount > 100) {
        segmentName = "Champions & High Value";
      } else if (cartCount > 0 && purchaseCount === 0) {
        segmentName = "Cart Abandoners";
      } else if (customer.sessions.length > 5) {
        segmentName = "High Intent Cohort";
      }

      // Upsert Segment record
      let segment = await prisma.segment.findFirst({
        where: { organizationId, name: segmentName },
      });

      if (!segment) {
        segment = await prisma.segment.create({
          data: {
            organizationId,
            name: segmentName,
            description: `Auto-generated ML segment for ${segmentName}`,
            isActive: true,
          },
        });
      }

      await prisma.customerSegment.upsert({
        where: { customerId_segmentId: { customerId: customer.id, segmentId: segment.id } },
        create: { customerId: customer.id, segmentId: segment.id },
        update: { assignedAt: new Date() },
      });
    }

    return { status: "SUCCESS", processedCustomers: customers.length };
  },

  async predict(organizationId: string, customerId: string) {
    const customerSegment = await prisma.customerSegment.findFirst({
      where: { customerId },
      include: { segment: true },
    });
    return customerSegment?.segment?.name ?? "Recent Browsers";
  },
};
