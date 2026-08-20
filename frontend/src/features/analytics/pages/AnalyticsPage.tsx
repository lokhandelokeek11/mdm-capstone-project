import { PageHeader } from "@/components/common/PageHeader";
import { ChartCard } from "@/components/charts/ChartCard";
import { StatCard } from "@/components/common/StatCard";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

export function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useDashboardAnalytics();

  if (isLoading) return <LoadingState rows={6} />;
  if (isError || !data) return <ErrorState message="Unable to load executive analytics" onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader title="Executive Analytics & Strategy Evaluation" description="Overall platform performance metrics, conversion funnels, and marketing action outcomes." />

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Total Sessions Logged", value: 2756101, change: 12.1 }} />
        <StatCard metric={{ label: "Overall Conversion Rate", value: 0.83, format: "percent", change: 0.12 }} />
        <StatCard metric={{ label: "Cart Abandonment Rate", value: 67.6, format: "percent", change: -1.8 }} />
        <StatCard metric={{ label: "Active Marketing Actions", value: 99, change: 14.5 }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Full Conversion Funnel Stage Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.funnel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }} />
              <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Conversion Velocity Trend (%)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.conversionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }} />
              <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: "#10B981" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

