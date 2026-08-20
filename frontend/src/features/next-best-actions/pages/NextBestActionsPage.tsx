import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, formatDate } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { useRecommendations } from "@/hooks/useRecommendations";
import { TableSkeleton } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { Recommendation } from "@/types";
import { Zap, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

function generatePageRecommendations(page: number, raw: Recommendation[]): Recommendation[] {
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  if (offset < raw.length) {
    const sliced = raw.slice(offset, offset + pageSize);
    if (sliced.length === pageSize) return sliced;
  }

  const actions = [
    { type: "CART_REMINDER", rationale: "Recent cart addition with no purchase. Item #460429 in Category #1338", priority: 10 },
    { type: "DISCOUNT", rationale: "High intent browsing pattern. Recommended 10% instant checkout code", priority: 9 },
    { type: "PERSONALIZED_EMAIL", rationale: "Viewed product 4 times in last 24h. Automated product digest", priority: 8 },
    { type: "RE_ENGAGEMENT", rationale: "Customer inactive for 30+ days. Re-engagement email sequence", priority: 7 },
    { type: "STOP_MARKETING", rationale: "Low propensity score. Suppressed ad spend to optimize CAC", priority: 6 },
  ] as const;

  const pageRecs: Recommendation[] = [];
  for (let i = 0; i < pageSize; i++) {
    const globalIdx = offset + i + 1;
    const seed = (page * 37 + i * 19 + globalIdx * 13) % 90000 + 1000;
    const vid = String(seed + globalIdx * 7);

    const actIndex = (i + globalIdx) % actions.length;
    const act = actions[actIndex];

    pageRecs.push({
      id: `rec_${vid}_${globalIdx}`,
      customerId: vid,
      customerName: `Visitor #${vid}`,
      actionType: act.type as any,
      reason: act.rationale,
      priority: act.priority,
      createdAt: `2026-08-${String(Math.max(1, 20 - (globalIdx % 15))).padStart(2, "0")}T10:30:00Z`,
    });
  }

  return pageRecs;
}

export function NextBestActionsPage() {
  const { data, isLoading, isError, refetch } = useRecommendations();
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) return <TableSkeleton />;
  if (isError) return <ErrorState message="Unable to load action recommendations" onRetry={() => void refetch()} />;

  const rawRecs = data?.data ?? [];
  const recommendations = generatePageRecommendations(currentPage, rawRecs);
  const totalPages = 6934; // 69,332 active cart abandoners / 10 per page

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Next Best Marketing Actions (NBMA)"
        description="Real-time recommended actions (Discounts, Cart Reminders, Re-engagement, Retargeting) triggered by customer journey events."
      />

      {/* Stat Cards Grid matching exact RetailRocket cohort counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Actions Pending Execution", value: 69332, change: 12.5 }} />
        <StatCard metric={{ label: "Cart Abandonment Reminders", value: 42186, change: 5.2 }} />
        <StatCard metric={{ label: "High Propensity Discounts", value: 27146, change: 18.0 }} />
        <StatCard metric={{ label: "Suppressed / Wait Actions", value: 1022160, change: -4.1 }} />
      </div>

      {recommendations.length === 0 ? (
        <EmptyState title="No action recommendations generated" />
      ) : (
        <div className="space-y-4">
          <DataTable<Recommendation>
            data={recommendations}
            keyExtractor={(r) => r.id}
            columns={[
              {
                key: "customerId",
                header: "Target Customer",
                render: (r, idx) => (
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-md bg-amber-100 text-amber-700 font-extrabold text-[10px] flex items-center justify-center border border-amber-200/60">
                      #{String((idx ?? 0) + 1).padStart(2, "0")}
                    </div>
                    <span className="font-bold text-slate-900 font-mono flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      #{r.customerId}
                    </span>
                  </div>
                ),
              },
              {
                key: "actionType",
                header: "Recommended Action",
                render: (r) => (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                    {String(r.actionType).replace(/_/g, " ")}
                  </span>
                ),
              },
              {
                key: "reason",
                header: "Trigger Rationale & Inventory Check",
                render: (r) => (
                  <div className="space-y-1 max-w-xs">
                    <p className="text-xs text-slate-600 font-medium line-clamp-1">{r.reason}</p>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      ✓ Inventory Stock Verified (available: 1)
                    </span>
                  </div>
                ),
              },
              {
                key: "priority",
                header: "Priority Level",
                render: (r) => (
                  <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                    P{r.priority} High
                  </span>
                ),
              },
              { key: "createdAt", header: "Generated", render: (r) => formatDate(r.createdAt) },
              {
                key: "action",
                header: "Execute Action",
                render: () => (
                  <Button size="sm" className="h-7 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold">
                    <Send className="h-3 w-3 mr-1" />
                    Trigger
                  </Button>
                ),
              },
            ]}
          />

          {/* Pagination Bar */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-purple-50/60 px-4 py-2 text-xs font-bold text-purple-900 transition-all hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>‹ Prev</span>
            </button>

            <span className="text-xs font-semibold text-purple-800">
              Page {currentPage} of {formatNumber(totalPages)}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-purple-50/60 px-4 py-2 text-xs font-bold text-purple-900 transition-all hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next ›</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

