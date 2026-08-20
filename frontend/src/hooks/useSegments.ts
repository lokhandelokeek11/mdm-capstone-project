import { useQuery } from "@tanstack/react-query";
import { mockSegments } from "@/features/segments/data/mockSegments";

const USE_MOCK = true;

export function useSegments() {
  return useQuery({
    queryKey: ["segments"],
    queryFn: async () => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        return { data: mockSegments };
      }
      const { segmentApi } = await import("@/lib/api/segmentApi");
      return segmentApi.list();
    },
  });
}
