import { prisma } from "@/lib/prisma";
import { getScoreByExternalId } from "@/lib/ml-artifacts";

const EVENT_LABEL: Record<string, string> = {
  view: "PRODUCT_VIEW",
  addtocart: "ADD_TO_CART",
  transaction: "PURCHASE",
};

export interface NextEventService {
  predict(organizationId: string, customerId: string): Promise<string | null>;
}

export const nextEventService: NextEventService = {
  async predict(organizationId, customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId },
    });
    if (!customer?.externalId) return null;

    const artifact = getScoreByExternalId(customer.externalId);
    if (!artifact) return null;
    return EVENT_LABEL[artifact.nextEvent] ?? artifact.nextEvent.toUpperCase();
  },
};
