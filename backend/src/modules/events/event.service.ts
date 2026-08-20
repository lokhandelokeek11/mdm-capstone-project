import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { EventIngestionInput } from "@/schemas";

export const eventService = {
  async list(organizationId: string, skip: number, limit: number) {
    return prisma.event.findMany({
      where: { organizationId },
      skip,
      take: limit,
      orderBy: { occurredAt: "desc" },
      include: { customer: true, product: true },
    });
  },

  async ingest(organizationId: string, data: EventIngestionInput) {
    return prisma.event.create({
      data: {
        organizationId,
        customerId: data.customerId,
        sessionId: data.sessionId,
        eventType: data.eventType,
        productId: data.productId,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
      },
    });
  },
};

export const sessionService = {
  async listByCustomer(organizationId: string, customerId: string) {
    return prisma.session.findMany({
      where: { organizationId, customerId },
      orderBy: { startedAt: "desc" },
      include: { events: { orderBy: { occurredAt: "asc" } } },
    });
  },
};

export const featureService = {
  async getByCustomer(organizationId: string, customerId: string) {
    return prisma.customerFeature.findMany({
      where: { organizationId, customerId },
    });
  },
};
