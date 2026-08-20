import { useQuery } from "@tanstack/react-query";
import { mockPredictions } from "@/features/intelligence/data/mockPredictions";

const USE_MOCK = true;

export function usePredictions() {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        return { data: mockPredictions };
      }
      const { predictionApi } = await import("@/lib/api/predictionApi");
      return predictionApi.list();
    },
  });
}
