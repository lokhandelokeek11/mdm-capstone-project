import { PageHeader } from "@/components/common/PageHeader";
import { ChartCard } from "@/components/charts/ChartCard";
import { StatCard } from "@/components/common/StatCard";
import { DataTable } from "@/components/common/DataTable";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Sparkles, Zap } from "lucide-react";

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

interface SegmentDetail {
  id: string;
  name: string;
  customerCount: number;
  avgRecencyDays: number;
  avgCartCount: number;
  propensityPct: number;
  targetAction: string;
  estimatedRevenue: string;
}

const segmentsList: SegmentDetail[] = [
  {
    id: "seg_1",
    name: "High Intent Cart Abandoners",
    customerCount: 69332,
    avgRecencyDays: 2,
    avgCartCount: 3.4,
    propensityPct: 78,
    targetAction: "CART_REMINDER",
    estimatedRevenue: "$4,210,000",
  },
  {
    id: "seg_2",
    name: "Frequent Repeat Buyers",
    customerCount: 22457,
    avgRecencyDays: 5,
    avgCartCount: 5.1,
    propensityPct: 94,
    targetAction: "VIP_REWARD / DISCOUNT",
    estimatedRevenue: "$12,850,000",
  },
  {
    id: "seg_3",
    name: "Active Product Browsers",
    customerCount: 293631,
    avgRecencyDays: 8,
    avgCartCount: 0.8,
    propensityPct: 35,
    targetAction: "PERSONALIZED_EMAIL",
    estimatedRevenue: "$1,450,000",
  },
  {
    id: "seg_4",
    name: "Inactive At-Risk Cohort",
    customerCount: 1022160,
    avgRecencyDays: 42,
    avgCartCount: 0.1,
    propensityPct: 8,
    targetAction: "STOP_MARKETING (CAC Suppress)",
    estimatedRevenue: "$0 (Ad Spend Saved)",
  },
];

const pieColors = ["#8B5CF6", "#10B981", "#3B82F6", "#64748B"];

const pieData = segmentsList.map((s) => ({
  name: s.name,
  value: s.customerCount,
}));

const rfmData = [
  { name: "Cart Abandoners", recency: 2, frequency: 3.4, monetary: 78 },
  { name: "Repeat Buyers", recency: 5, frequency: 5.1, monetary: 94 },
  { name: "Active Browsers", recency: 8, frequency: 1.8, monetary: 35 },
  { name: "Inactive Cohort", recency: 42, frequency: 0.3, monetary: 8 },
];

export function SegmentAnalyticsPage() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Behavioral Segment Analytics"
        description="ML-derived customer cohort distribution, RFM feature scores, and targeted marketing action performance."
      />

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Cart Abandoners Cohort", value: 69332, change: 5.2 }} />
        <StatCard metric={{ label: "Repeat Buyer Cohort", value: 22457, change: 14.1 }} />
        <StatCard metric={{ label: "Active Browsers Cohort", value: 293631, change: 8.9 }} />
        <StatCard metric={{ label: "Suppressed Inactive Cohort", value: 1022160, change: -2.4 }} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Customer Base Segment Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="RFM Velocity Score Comparison (Monetary % vs Frequency)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rfmData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }} />
              <Bar dataKey="monetary" name="Propensity Intent %" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="frequency" name="Avg Events / Visitor" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Detailed Segment Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600" />
          ML Segment Performance & Action Mapping
        </h3>

        <DataTable<SegmentDetail>
          data={segmentsList}
          keyExtractor={(s) => s.id}
          columns={[
            {
              key: "name",
              header: "Behavioral Segment Cluster",
              render: (s) => (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-600" />
                  <span className="font-bold text-slate-900 text-xs">{s.name}</span>
                </div>
              ),
            },
            {
              key: "customerCount",
              header: "Customer Count",
              render: (s) => <span className="font-mono text-xs font-bold text-slate-800">{formatNumber(s.customerCount)}</span>,
            },
            {
              key: "avgRecencyDays",
              header: "Avg Recency",
              render: (s) => <span className="text-xs font-semibold text-slate-700">{s.avgRecencyDays} days ago</span>,
            },
            {
              key: "propensityPct",
              header: "Purchase Intent",
              render: (s) => (
                <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
                  <Sparkles className="h-3 w-3 text-purple-600" />
                  {s.propensityPct}%
                </span>
              ),
            },
            {
              key: "targetAction",
              header: "Target NBMA Policy",
              render: (s) => (
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-200">
                  <Zap className="h-3 w-3 text-amber-500" />
                  {s.targetAction}
                </span>
              ),
            },
            {
              key: "estimatedRevenue",
              header: "Revenue Attribution",
              render: (s) => (
                <span className="font-mono text-xs font-extrabold text-emerald-700">{s.estimatedRevenue}</span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
