import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSegments } from "@/hooks/useSegments";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatNumber } from "@/lib/utils/cn";
import { PieChart as PieIcon, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function SegmentsPage() {
  const { data, isLoading, isError, refetch } = useSegments();

  if (isLoading) return <LoadingState rows={5} />;
  if (isError) return <ErrorState message="Unable to load customer segments" onRetry={() => void refetch()} />;

  const segments = data?.data ?? [];
  const totalInSegments = segments.reduce((sum, s) => sum + (s.customerCount ?? 0), 0);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Behavioral & ML Customer Segments"
        description="Explore RFM clusters, high-value cohorts, cart abandoners, and machine-learning driven segments."
      />

      {/* Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Active Segments", value: 4 }} />
        <StatCard metric={{ label: "Total Segmented Users", value: 1407580, change: 8.4 }} />
        <StatCard metric={{ label: "High Intent Cohort", value: 27146, change: 14.5 }} />
        <StatCard metric={{ label: "Repeat Buyer Segment", value: 2576, change: 6.3 }} />
      </div>

      {segments.length === 0 ? (
        <EmptyState title="No customer segments configured" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map((segment) => {
            const percentage = totalInSegments > 0 ? Math.round((segment.customerCount / totalInSegments) * 100) : 25;

            return (
              <Card
                key={segment.id}
                className="group flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div>
                  <CardHeader className="border-b border-slate-100/80 pb-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 font-bold flex items-center justify-center border border-purple-200/60">
                          <PieIcon className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {segment.name}
                        </CardTitle>
                      </div>
                      <span
                        className={
                          segment.isActive
                            ? "rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold uppercase"
                            : "rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase"
                        }
                      >
                        {segment.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {segment.description}
                    </p>

                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900">{formatNumber(segment.customerCount)}</span>
                        <span className="text-xs font-bold text-purple-600">{percentage}% of total</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">Target Customers</p>
                      
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${Math.max(percentage, 8)}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    Auto-updated
                  </span>
                  <Link
                    to={`/customers?filter=${segment.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>View Cohort</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

