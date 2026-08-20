import { prisma } from "@/lib/prisma";

export const analyticsService = {
  async getOverview(organizationId: string) {
    const [totalCustomers, totalSessions, totalEvents, totalTransactions] = await Promise.all([
      prisma.customer.count({ where: { organizationId } }),
      prisma.session.count({ where: { organizationId } }),
      prisma.event.count({ where: { organizationId } }),
      prisma.transaction.count({ where: { organizationId } }),
    ]);

    return {
      totalCustomers,
      totalSessions,
      totalEvents,
      totalTransactions,
      conversionRate: totalCustomers > 0 ? (totalTransactions / totalCustomers) * 100 : 0,
    };
  },

  async getFunnel(organizationId: string) {
    const eventCounts = await prisma.event.groupBy({
      by: ["eventType"],
      where: { organizationId },
      _count: { id: true },
    });
    return eventCounts;
  },

  async getSegmentAnalytics(organizationId: string) {
    const segments = await prisma.segment.findMany({
      where: { organizationId },
      include: { _count: { select: { customerSegments: true } } },
    });
    return segments.map((s) => ({
      id: s.id,
      name: s.name,
      customerCount: s._count.customerSegments,
    }));
  },

  async getProductAnalytics(organizationId: string) {
    const products = await prisma.product.findMany({
      where: { organizationId },
      take: 20,
      include: { _count: { select: { events: true, transactions: true } } },
    });
    return products;
  },
};
