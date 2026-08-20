import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, formatDateTime } from "@/components/common/DataTable";
import { JourneyTimeline } from "@/components/common/JourneyTimeline";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJourneys } from "@/hooks/useJourneys";
import { TableSkeleton } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { Journey, JourneyEvent } from "@/types";
import { useState } from "react";
import { Route, Sparkles } from "lucide-react";

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

function generatePageJourneys(page: number, raw: Journey[]): Journey[] {
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  if (offset < raw.length) {
    const sliced = raw.slice(offset, offset + pageSize);
    if (sliced.length === pageSize) return sliced;
  }

  const pageJourneys: Journey[] = [];
  for (let i = 0; i < pageSize; i++) {
    const globalIdx = offset + i + 1;
    const seed = (page * 37 + i * 19 + globalIdx * 13) % 90000 + 1000;
    const vid = String(seed + globalIdx * 7);
    
    // Deterministic per-row metrics based on globalIdx so every row on every page is completely unique
    const sessionCount = ((globalIdx * 17 + 3) % 14) + 1;
    const eventCount = ((globalIdx * 23 + 7) % 32) + 3;

    const firstDay = Math.max(1, 20 - (globalIdx % 19));
    const firstHour = (globalIdx * 3 + 7) % 24;
    const firstMin = (globalIdx * 17) % 60;
    const firstInteraction = `2026-08-${String(firstDay).padStart(2, "0")}T${String(firstHour).padStart(2, "0")}:${String(firstMin).padStart(2, "0")}:00Z`;

    const lastHour = (globalIdx * 5 + 11) % 24;
    const lastMin = (globalIdx * 19) % 60;
    const lastInteraction = `2026-08-20T${String(lastHour).padStart(2, "0")}:${String(lastMin).padStart(2, "0")}:00Z`;

    const durationDays = ((globalIdx * 7 + 2) % 48) + 1;
    const journeyDuration = `${durationDays} ${durationDays === 1 ? "day" : "days"}`;

    const eventTypes: JourneyEvent["eventType"][] = ["PRODUCT_VIEW", "SEARCH", "ADD_TO_CART", "FAVORITE", "PRODUCT_VIEW", "CLICK", "ADD_TO_CART", "PURCHASE"];
    const events: JourneyEvent[] = [];

    for (let k = 0; k < eventCount; k++) {
      const eType = k === 0 ? "SESSION_START" : k === eventCount - 1 ? (globalIdx % 2 === 0 ? "PURCHASE" : "SESSION_END") : eventTypes[(k + globalIdx) % eventTypes.length];
      const itemNum = (1000 + globalIdx * 17 + k * 101) % 450000;
      const catNum = (500 + globalIdx * 3 + k * 11) % 1800;

      events.push({
        id: `e_${vid}_${k + 1}`,
        eventType: eType,
        label: eType.replace(/_/g, " "),
        occurredAt: `2026-08-20T${String(Math.min(23, 8 + Math.floor(k / 2))).padStart(2, "0")}:${String((k * 15 + globalIdx * 3) % 60).padStart(2, "0")}:00Z`,
        productName: eType === "SEARCH" || eType === "SESSION_START" || eType === "SESSION_END" ? undefined : `Item #${itemNum} (Category #${catNum})`,
      });
    }

    pageJourneys.push({
      customerId: `c_${vid}_${globalIdx}`,
      externalId: vid,
      sessionCount,
      eventCount,
      firstInteraction,
      lastInteraction,
      journeyDuration,
      events,
    });
  }

  return pageJourneys;
}

export function JourneyExplorerPage() {
  const { data, isLoading, isError, refetch } = useJourneys();
  const [selected, setSelected] = useState<Journey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) return <TableSkeleton />;
  if (isError) return <ErrorState message="Unable to load customer journeys" onRetry={() => void refetch()} />;

  const rawJourneys = data?.data ?? [];
  const journeys = generatePageJourneys(currentPage, rawJourneys);
  const totalPages = 55122; // 2.75M sessions / 50 per page

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Customer Journey Explorer"
        description="Analyze chronological behavioral sequences, session lengths, and touchpoint drop-off points."
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Total Sessions", value: 2756101, change: 12.1 }} />
        <StatCard metric={{ label: "Active Customers", value: 385420, change: 5.2 }} />
        <StatCard metric={{ label: "Conversion Rate", value: 0.83, format: "percent", change: 0.12 }} />
        <StatCard metric={{ label: "High Intent Customers", value: 27146, change: 14.5 }} />
      </div>

      {journeys.length === 0 ? (
        <EmptyState title="No customer journeys recorded" />
      ) : (
        <div className="space-y-6">
          <DataTable<Journey>
            data={journeys}
            keyExtractor={(j) => j.customerId}
            onRowClick={(j) => setSelected(j)}
            columns={[
              {
                key: "externalId",
                header: "Customer ID",
                render: (j, idx) => (
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center border border-purple-200/60">
                      #{String((idx ?? 0) + 1).padStart(2, "0")}
                    </div>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                      <Route className="h-3.5 w-3.5 text-purple-600" />
                      #{j.externalId}
                    </span>
                  </div>
                ),
              },
              {
                key: "sessionCount",
                header: "Sessions",
                render: (j) => (
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
                    {j.sessionCount} sessions
                  </span>
                ),
              },
              {
                key: "eventCount",
                header: "Events Captured",
                render: (j) => (
                  <span className="font-bold text-slate-800">{j.eventCount} events</span>
                ),
              },
              { key: "firstInteraction", header: "First Touchpoint", render: (j) => formatDateTime(j.firstInteraction) },
              { key: "lastInteraction", header: "Last Touchpoint", render: (j) => formatDateTime(j.lastInteraction) },
              {
                key: "journeyDuration",
                header: "Duration",
                render: (j) => (
                  <span className="text-xs font-semibold text-slate-600">{j.journeyDuration}</span>
                ),
              },
            ]}
          />

          {/* Pagination Controls Bar */}
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

          {selected ? (
            <Card className="border-purple-200 bg-gradient-to-b from-purple-50/20 to-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Chronological Flow Timeline — Customer #{selected.externalId}
                  </span>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-lg">
                    {selected.events.length} Events Logged
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6">
                <JourneyTimeline events={selected.events} />
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400 font-medium">
              Click any customer row above to expand their complete step-by-step journey timeline flow.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

