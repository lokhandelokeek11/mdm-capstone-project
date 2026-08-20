import { useQuery } from "@tanstack/react-query";
import {
  dashboardMetrics,
  funnelData,
  journeyStageDistribution,
  segmentDistribution,
  conversionTrend,
} from "@/features/dashboard/data/mockDashboardData";
import type { AnalyticsMetric } from "@/types";

const USE_MOCK = true;

export interface DashboardAnalytics {
  metrics: AnalyticsMetric[];
  funnel: typeof funnelData;
  journeyStages: typeof journeyStageDistribution;
  segments: typeof segmentDistribution;
  conversionTrend: typeof conversionTrend;
}

export function useDashboardAnalytics() {
  return useQuery<DashboardAnalytics>({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        return {
          metrics: dashboardMetrics,
          funnel: funnelData,
          journeyStages: journeyStageDistribution,
          segments: segmentDistribution,
          conversionTrend,
        };
      }
      const { analyticsApi } = await import("@/lib/api/analyticsApi");
      await analyticsApi.overview();
      return {
        metrics: dashboardMetrics,
        funnel: funnelData,
        journeyStages: journeyStageDistribution,
        segments: segmentDistribution,
        conversionTrend,
      };
    },
  });
}
