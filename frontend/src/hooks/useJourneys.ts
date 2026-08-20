import { useQuery } from "@tanstack/react-query";
import { mockJourneys } from "@/features/journeys/data/mockJourneys";

const USE_MOCK = true;

export function useJourneys() {
  return useQuery({
    queryKey: ["journeys"],
    queryFn: async () => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        return { data: mockJourneys };
      }
      const { journeyApi } = await import("@/lib/api/journeyApi");
      return journeyApi.list();
    },
  });
}

export function useJourney(customerId: string) {
  return useQuery({
    queryKey: ["journey", customerId],
    queryFn: async () => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        const journey = mockJourneys.find((j) => j.customerId === customerId || j.externalId === customerId);
        if (!journey) throw new Error("Journey not found");
        return { data: journey };
      }
      const { journeyApi } = await import("@/lib/api/journeyApi");
      return journeyApi.getByCustomerId(customerId);
    },
    enabled: !!customerId,
  });
}
