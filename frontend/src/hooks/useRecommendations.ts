import { useQuery } from "@tanstack/react-query";
import { mockRecommendations } from "@/features/next-best-actions/data/mockRecommendations";

const USE_MOCK = true;

export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        return { data: mockRecommendations };
      }
      const { recommendationApi } = await import("@/lib/api/recommendationApi");
      return recommendationApi.list();
    },
  });
}
