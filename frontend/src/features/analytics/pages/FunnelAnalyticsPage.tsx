import { PageHeader } from "@/components/common/PageHeader";
import { ChartCard } from "@/components/charts/ChartCard";
import { StatCard } from "@/components/common/StatCard";
import { DataTable } from "@/components/common/DataTable";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import { ArrowRight, Filter, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

const funnelData = [
  { stage: "1. Awareness (Product Views)", count: 2664312, percentage: "100%", dropoff: "0%", color: "#6366F1" },
  { stage: "2. Consideration (Item Detail)", count: 1407580, percentage: "52.8%", dropoff: "47.2%", color: "#8B5CF6" },
  { stage: "3. Intent (Add to Cart)", count: 69332, percentage: "2.6%", dropoff: "95.1%", color: "#EC4899" },
  { stage: "4. Checkout (Transactions)", count: 22457, percentage: "0.84%", dropoff: "67.6%", color: "#10B981" },
];

const dailyFunnelVelocity = [
  { date: "Aug 01", views: 82100, carts: 2150, orders: 710 },
  { date: "Aug 05", views: 94300, carts: 2480, orders: 830 },
  { date: "Aug 10", views: 88900, carts: 2310, orders: 760 },
  { date: "Aug 15", views: 104200, carts: 2790, orders: 940 },
  { date: "Aug 20", views: 112500, carts: 2980, orders: 990 },
];

interface FunnelStageDetail {
  id: string;
  fromStage: string;
  toStage: string;
  startVolume: number;
  endVolume: number;
  dropRate: string;
  conversionRate: string;
  status: string;
}

const stageDetails: FunnelStageDetail[] = [
  {
    id: "fs_1",
    fromStage: "1. Awareness (Product Views)",
    toStage: "2. Consideration (Unique Visitors)",
    startVolume: 2664312,
    endVolume: 1407580,
    dropRate: "47.2%",
    conversionRate: "52.8%",
    status: "Healthy Traffic Velocity",
  },
  {
    id: "fs_2",
    fromStage: "2. Consideration (Unique Visitors)",
    toStage: "3. Intent (Add to Cart)",
    startVolume: 1407580,
    endVolume: 69332,
    dropRate: "95.1%",
    conversionRate: "4.92%",
    status: "Critical Friction Point",
  },
  {
    id: "fs_3",
    fromStage: "3. Intent (Add to Cart)",
    toStage: "4. Checkout (Transactions)",
    startVolume: 69332,
    endVolume: 22457,
    dropRate: "67.6%",
    conversionRate: "32.39%",
    status: "NBMA Targeted Opportunity",
  },
];

export function FunnelAnalyticsPage() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Conversion Funnel Analytics"
        description="End-to-end visitor conversion flow analysis across 2.75M interactions from Awareness to Order Completion."
      />

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Product View Interactions", value: 2664312, change: 11.2 }} />
        <StatCard metric={{ label: "Unique Active Visitors", value: 1407580, change: 8.4 }} />
        <StatCard metric={{ label: "Cart Addition Events", value: 69332, change: 5.1 }} />
        <StatCard metric={{ label: "Completed Orders", value: 22457, change: 14.2 }} />
      </div>

      {/* Visual Funnel Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Stage-by-Stage Visitor Progression (Count)">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis dataKey="stage" type="category" width={180} tick={{ fontSize: 11, fill: "#334155", fontWeight: 600 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }} />
              <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Event Velocity (Views vs Carts vs Orders)">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={dailyFunnelVelocity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }} />
              <Area type="monotone" dataKey="views" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
              <Area type="monotone" dataKey="carts" stroke="#EC4899" fill="#EC4899" fillOpacity={0.3} />
              <Area type="monotone" dataKey="orders" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Stage-by-Stage Loss Matrix Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Filter className="h-4 w-4 text-purple-600" />
          Funnel Stage Transition & Drop-off Breakdown
        </h3>

        <DataTable<FunnelStageDetail>
          data={stageDetails}
          keyExtractor={(d) => d.id}
          columns={[
            {
              key: "fromStage",
              header: "Transition Pipeline",
              render: (d) => (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <span>{d.fromStage}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  <span className="text-purple-700 font-bold">{d.toStage}</span>
                </div>
              ),
            },
            {
              key: "startVolume",
              header: "Entry Volume",
              render: (d) => <span className="font-mono text-xs font-bold text-slate-800">{formatNumber(d.startVolume)}</span>,
            },
            {
              key: "endVolume",
              header: "Completed Volume",
              render: (d) => <span className="font-mono text-xs font-bold text-emerald-700">{formatNumber(d.endVolume)}</span>,
            },
            {
              key: "conversionRate",
              header: "Throughput %",
              render: (d) => (
                <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  {d.conversionRate}
                </span>
              ),
            },
            {
              key: "dropRate",
              header: "Drop-off %",
              render: (d) => (
                <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                  <TrendingDown className="h-3 w-3" />
                  {d.dropRate}
                </span>
              ),
            },
            {
              key: "status",
              header: "Operational Assessment",
              render: (d) => (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                    d.status.includes("Friction")
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : d.status.includes("Opportunity")
                      ? "bg-purple-50 text-purple-800 border border-purple-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {d.status.includes("Friction") ? (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                  )}
                  {d.status}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
