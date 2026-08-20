import { prisma } from "@/lib/prisma";

export const journeyService = {
  async list(organizationId: string, skip: number, limit: number) {
    const customers = await prisma.customer.findMany({
      where: { organizationId },
      skip,
      take: limit,
      include: {
        sessions: true,
        events: { orderBy: { occurredAt: "asc" }, take: 1 },
        _count: { select: { sessions: true, events: true } },
      },
    });

    return customers.map((customer) => {
      const events = customer.events;
      const firstEvent = events[0];
      const lastEvent = events[events.length - 1];
      return {
        customerId: customer.id,
        externalId: customer.externalId,
        sessionCount: customer._count.sessions,
        eventCount: customer._count.events,
        firstInteraction: firstEvent?.occurredAt ?? null,
        lastInteraction: lastEvent?.occurredAt ?? null,
        journeyDuration: null as number | null,
      };
    });
  },

  async getByCustomerId(organizationId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId },
      include: {
        sessions: { orderBy: { startedAt: "asc" } },
        events: { orderBy: { occurredAt: "asc" }, include: { product: true } },
      },
    });
    return customer;
  },
};
