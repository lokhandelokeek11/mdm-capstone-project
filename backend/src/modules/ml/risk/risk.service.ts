import { prisma } from "@/lib/prisma";
import { getScoreByExternalId } from "@/lib/ml-artifacts";

export const riskService = {
  async predictChurnRisk(organizationId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId },
      include: { events: { orderBy: { occurredAt: "desc" }, take: 1 } },
    });

    if (!customer) {
      return { churnRiskScore: 0.8, status: "HIGH_RISK" };
    }

    if (customer.externalId) {
      const artifact = getScoreByExternalId(customer.externalId);
      if (artifact) {
        const churnRiskScore = artifact.churnRisk;
        let status = "LOW_RISK";
        if (churnRiskScore > 0.6) status = "HIGH_RISK";
        else if (churnRiskScore > 0.3) status = "MEDIUM_RISK";
        return {
          churnRiskScore,
          status,
          explanation: `XGBoost churn model (offline evaluation): risk ${(churnRiskScore * 100).toFixed(0)}%.`,
        };
      }
    }

    if (customer.events.length === 0) {
      return { churnRiskScore: 0.8, status: "HIGH_RISK" };
    }

    const lastEventTime = customer.events[0].occurredAt.getTime();
    const daysInactive = Math.floor((Date.now() - lastEventTime) / (1000 * 60 * 60 * 24));

    const churnRiskScore = Math.min(0.99, Math.max(0.05, daysInactive * 0.03));
    let status = "LOW_RISK";
    if (churnRiskScore > 0.6) status = "HIGH_RISK";
    else if (churnRiskScore > 0.3) status = "MEDIUM_RISK";

    return {
      churnRiskScore,
      daysInactive,
      status,
      explanation: `Customer inactive for ${daysInactive} days since last session.`,
    };
  },
};
