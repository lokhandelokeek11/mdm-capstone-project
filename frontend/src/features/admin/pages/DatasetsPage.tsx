import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, formatDate } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { mockDatasets } from "@/features/admin/data/mockDatasets";
import { formatNumber } from "@/lib/utils/cn";
import { Upload, Database, FileSpreadsheet } from "lucide-react";
import type { Dataset } from "@/types";

const statusStyle: Record<string, string> = {
  READY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

export function DatasetsPage() {
  const totalRows = mockDatasets.reduce((sum, d) => sum + d.rowCount, 0);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Behavioral Data Sources & Imports"
        description="Manage CSV/JSON customer event imports, column adapter schemas, and tracking connections."
        actions={
          <Button asChild className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm">
            <Link to="/admin/datasets/upload">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload Dataset Wizard
            </Link>
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Active Datasets", value: mockDatasets.length }} />
        <StatCard metric={{ label: "Total Rows Ingested", value: totalRows || 2756101 }} />
        <StatCard metric={{ label: "CSV File Imports", value: 4 }} />
        <StatCard metric={{ label: "Data Pipeline Status", value: 100, format: "percent" }} />
      </div>

      <DataTable<Dataset>
        data={mockDatasets}
        keyExtractor={(d) => d.id}
        columns={[
          {
            key: "name",
            header: "Dataset Name",
            render: (d) => (
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200/60">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{d.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium max-w-xs truncate">{d.description}</p>
                </div>
              </div>
            ),
          },
          {
            key: "sourceType",
            header: "Source Adapter",
            render: (d) => (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                <Database className="h-3 w-3 text-purple-500" />
                {d.sourceType}
              </span>
            ),
          },
          {
            key: "status",
            header: "Ingestion Status",
            render: (d) => (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase ${statusStyle[d.status] ?? "bg-slate-100 text-slate-600"}`}>
                {d.status}
              </span>
            ),
          },
          {
            key: "rowCount",
            header: "Processed Rows",
            render: (d) => <span className="font-bold text-slate-800">{formatNumber(d.rowCount)} rows</span>,
          },
          { key: "createdAt", header: "Ingested At", render: (d) => formatDate(d.createdAt) },
        ]}
      />
    </div>
  );
}

