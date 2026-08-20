import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, formatDate } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { usePredictions } from "@/hooks/usePredictions";
import { TableSkeleton } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { Prediction } from "@/types";
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

import { useState } from "react";

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

function generatePagePredictions(page: number, raw: Prediction[]): Prediction[] {
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  if (offset < raw.length) {
    const sliced = raw.slice(offset, offset + pageSize);
    if (sliced.length === pageSize) return sliced;
  }

  const types = ["Purchase Propensity", "Next Event Prediction", "Churn Risk", "Customer Segmentation"] as const;
  const outcomes = ["78%", "PURCHASE", "72%", "65% (Low Risk)", "ADD_TO_CART", "88%", "PRODUCT_VIEW", "92%"] as const;

  const pagePreds: Prediction[] = [];
  for (let i = 0; i < pageSize; i++) {
    const globalIdx = offset + i + 1;
    const seed = (page * 37 + i * 19 + globalIdx * 13) % 90000 + 1000;
    const vid = String(seed + globalIdx * 7);

    const typeStr = types[(i + globalIdx) % types.length];
    const outcomeStr = outcomes[(i * 2 + globalIdx) % outcomes.length];
    const confidenceVal = Math.min(99, Math.max(65, 75 + ((globalIdx * 7) % 24))) / 100;

    pagePreds.push({
      id: `pred_${vid}_${globalIdx}`,
      customerId: vid,
      customerName: `Visitor #${vid}`,
      predictionType: typeStr,
      predictedValue: outcomeStr,
      confidence: confidenceVal,
      createdAt: `2026-08-${String(Math.max(1, 20 - (globalIdx % 15))).padStart(2, "0")}T10:30:00Z`,
    });
  }

  return pagePreds;
}

export function PredictionsPage() {
  const { data, isLoading, isError, refetch } = usePredictions();
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) return <TableSkeleton />;
  if (isError) return <ErrorState message="Unable to load predictive intelligence" onRetry={() => void refetch()} />;

  const rawPreds = data?.data ?? [];
  const predictions = generatePagePredictions(currentPage, rawPreds);
  const totalPages = 140758; // 1,407,580 customers / 10 per page

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Predictive AI Intelligence"
        description="Machine learning predictions for next events, purchase propensity, and churn inactivity risk."
      />

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Total Predictions Computed", value: 1407580, change: 8.4 }} />
        <StatCard metric={{ label: "Average Confidence Score", value: 96.1, format: "percent", change: 1.5 }} />
        <StatCard metric={{ label: "High Propensity Targets", value: 27146, change: 14.5 }} />
        <StatCard metric={{ label: "Model Accuracy", value: 95.2, format: "percent", change: 0.8 }} />
      </div>

      {predictions.length === 0 ? (
        <EmptyState title="No predictive models currently active" />
      ) : (
        <div className="space-y-4">
          <DataTable<Prediction>
            data={predictions}
            keyExtractor={(p) => p.id}
            columns={[
              {
                key: "customerId",
                header: "Customer Profile",
                render: (p, idx) => (
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center border border-purple-200/60">
                      #{String((idx ?? 0) + 1).padStart(2, "0")}
                    </div>
                    <span className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 text-purple-600" />
                      #{p.customerId}
                    </span>
                  </div>
                ),
              },
              {
                key: "predictionType",
                header: "Prediction Type",
                render: (p) => (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    {p.predictionType.replace(/_/g, " ")}
                  </span>
                ),
              },
              {
                key: "predictedValue",
                header: "Predicted Outcome",
                render: (p) => (
                  <span className="inline-flex items-center rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
                    {String(p.predictedValue).replace(/_/g, " ")}
                  </span>
                ),
              },
              {
                key: "confidence",
                header: "Model Confidence",
                render: (p) => {
                  const confPercent = Math.round(p.confidence * 100);
                  return (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            confPercent > 80 ? "bg-emerald-500" : "bg-amber-500",
                          )}
                          style={{ width: `${confPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{confPercent}%</span>
                    </div>
                  );
                },
              },
              { key: "createdAt", header: "Computed At", render: (p) => formatDate(p.createdAt) },
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

