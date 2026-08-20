import { RecommendedActionType } from "@/generated/prisma/client";

/**
 * Placeholder for the Next Best Action decision engine.
 * Future: combines Prediction + Journey Stage + Segment + Behavioral Features
 * to determine the optimal marketing action.
 */
export const nextBestActionService = {
  async determineAction(_params: {
    organizationId: string;
    customerId: string;
  }): Promise<{ actionType: RecommendedActionType; reason: string } | null> {
    // Decision logic will be implemented in a future phase
    return null;
  },
};

export { RecommendedActionType };
