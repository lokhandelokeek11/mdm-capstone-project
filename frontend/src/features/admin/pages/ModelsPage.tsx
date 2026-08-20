import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, formatDate } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { mockModels } from "@/features/admin/data/mockModels";
import type { Model } from "@/types";
import { Cpu, Sparkles } from "lucide-react";

const statusStyle: Record<string, string> = {
  READY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  TRAINING: "bg-amber-50 text-amber-700 border-amber-200",
  DEPRECATED: "bg-slate-100 text-slate-600 border-slate-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

export function ModelsPage() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Machine Learning Models & Versions"
        description="Monitor trained model versions for Customer Segmentation, Purchase Propensity, Churn Risk, and Next Best Action prediction."
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Active Model Instances", value: mockModels.length }} />
        <StatCard metric={{ label: "Avg Model Accuracy", value: 94.6, format: "percent", change: 0.8 }} />
        <StatCard metric={{ label: "Training Pipelines", value: 4 }} />
        <StatCard metric={{ label: "Inference Latency", value: 18 }} />
      </div>

      <DataTable<Model>
        data={mockModels}
        keyExtractor={(m) => m.id}
        columns={[
          {
            key: "name",
            header: "Model Name",
            render: (m) => (
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200/60">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{m.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{m.version}</p>
                </div>
              </div>
            ),
          },
          {
            key: "modelType",
            header: "Architecture",
            render: (m) => (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                <Sparkles className="h-3 w-3 text-purple-500" />
                {m.modelType}
              </span>
            ),
          },
          {
            key: "status",
            header: "Deployment Status",
            render: (m) => (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase ${statusStyle[m.status] ?? "bg-slate-100 text-slate-600"}`}>
                {m.status}
              </span>
            ),
          },
          {
            key: "metrics",
            header: "Evaluation Metrics",
            render: (m) =>
              m.metrics ? (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(m.metrics).map(([k, v]) => (
                    <span key={k} className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 font-medium">—</span>
              ),
          },
          { key: "createdAt", header: "Trained At", render: (m) => formatDate(m.createdAt) },
        ]}
      />
    </div>
  );
}

