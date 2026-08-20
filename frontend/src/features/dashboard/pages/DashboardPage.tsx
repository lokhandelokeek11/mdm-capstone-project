import { Link } from "react-router-dom";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useAuth } from "@/lib/auth/AuthProvider";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import {
  commonJourneyPaths,
  recentJourneys,
  topOpportunities,
} from "@/features/dashboard/data/mockDashboardData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { CustomerStageBadge } from "@/components/common/CustomerStageBadge";
import {
  ArrowRight,
  Route,
  PieChart as PieChartIcon,
  Zap,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const CHART_COLORS = [
  "#7C3AED", // Vibrant Purple
  "#3B82F6", // Royal Blue
  "#10B981", // Emerald Green
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#64748B", // Slate
];

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useDashboardAnalytics();

  if (isLoading) return <LoadingState rows={8} />;
  if (isError || !data) return <ErrorState message="Unable to load dashboard analytics" onRetry={() => void refetch()} />;

  const quickActions = [
    {
      title: "Customer Journey Explorer",
      description: "Analyze end-to-end customer events, sessions, and conversion drop-offs",
      icon: Route,
      color: "bg-purple-100/90 text-purple-600 border-purple-200/60",
      href: "/journeys",
    },
    {
      title: "Behavioral Segmentation",
      description: "Explore RFM behavioral segments and automated ML clusters",
      icon: PieChartIcon,
      color: "bg-pink-100/90 text-pink-600 border-pink-200/60",
      href: "/segments",
    },
    {
      title: "Next Best Marketing Actions",
      description: "View real-time recommendations, cart reminders, and propensity scores",
      icon: Zap,
      color: "bg-amber-100/90 text-amber-600 border-amber-200/60",
      href: "/next-best-actions",
    },
    {
      title: "Executive Funnel Analytics",
      description: "Track journey stage distribution, conversion velocity, and campaign trends",
      icon: BarChart3,
      color: "bg-emerald-100/90 text-emerald-600 border-emerald-200/60",
      href: "/analytics",
    },
  ];

  const userName = (!user?.name || user.name.includes("Demo") || user.name.includes("Ashish")) ? "Lokeek Lokhande" : user.name;

  return (
    <div className="space-y-6 pb-12">
      {/* Signature Purple Hero Banner matching reference Image 2 */}
      <div className="relative overflow-hidden rounded-3xl hero-gradient p-8 text-white shadow-xl shadow-purple-950/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full hero-glow-circle blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-48 w-48 rounded-full hero-glow-circle blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md border border-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              CUSTOMER INTELLIGENCE PLATFORM
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Good evening! {userName} 👋
            </h1>
            <p className="text-purple-100 text-sm max-w-xl font-medium">
              Here&apos;s what&apos;s happening across customer journeys, predictive scores, and marketing actions today.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-md p-3 border border-white/20 shrink-0">
            <div className="h-10 w-10 rounded-full bg-white text-purple-700 font-extrabold flex items-center justify-center text-lg shadow-md">
              {userName.charAt(0)}
            </div>
            <div className="text-left pr-2">
              <p className="text-xs font-bold leading-tight text-white">{userName}</p>
              <p className="text-[10px] text-purple-200 font-medium">{user?.role ?? "Admin & Marketing Lead"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid matching Image 2 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.metrics?.slice(0, 8).map((metric) => (
          <StatCard key={metric.label} metric={metric} />
        ))}
      </div>

      {/* Sub-Summary Metric Strip matching reference Image 2 */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Platform Overview:</span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-0.5 font-bold text-purple-700">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
              Active: 3,421 customers
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-600">28,456 sessions</span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-600">3.8% conversion rate</span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-600">2 admins active</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <span>Inactive / Drop-off:</span>
            <span className="font-bold text-slate-700">4,521 customers</span>
            <span>•</span>
            <span className="font-bold text-amber-600">892 high intent</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid matching Image 2 */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Quick Actions</h2>
          <p className="text-xs text-slate-500 font-medium">Jump directly to key platform intelligence modules</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Customer Journey Funnel">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.funnel} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis dataKey="stage" type="category" width={100} tick={{ fontSize: 11, fill: "#334155" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
              />
              <Bar dataKey="count" fill="#7C3AED" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Journey Stage Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.journeyStages ?? []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={45}
                paddingAngle={3}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              >
                {(data.journeyStages ?? []).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer Segments Overview">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.segments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Conversion Rate Trend (%)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.conversionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                formatter={(v) => [`${v}%`, "Conversion Rate"]}
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
              />
              <Line type="monotone" dataKey="rate" stroke="#EC4899" strokeWidth={3} dot={{ r: 4, fill: "#EC4899" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Opportunities and Customer Journeys Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Top Next Best Action Opportunities">
          <div className="space-y-3">
            {topOpportunities.map((opp) => (
              <div key={opp.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 hover:bg-white transition-colors">
                <div>
                  <p className="font-bold text-sm text-slate-800">Customer #{opp.customerId}</p>
                  <p className="text-xs text-slate-500 font-medium">{opp.segment}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 text-xs font-semibold">
                    {opp.action.replace(/_/g, " ")}
                  </Badge>
                  <p className="mt-1 text-xs font-bold text-emerald-600">{opp.propensity}% propensity</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Recent Customer Journey Activity">
          <div className="space-y-3">
            {recentJourneys.map((j) => (
              <div key={j.customerId} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 hover:bg-white transition-colors">
                <div>
                  <p className="font-bold text-sm text-slate-800">Customer #{j.customerId}</p>
                  <p className="text-xs text-slate-500 font-medium">{j.events} events · {j.lastEvent}</p>
                </div>
                <div className="text-right">
                  <CustomerStageBadge stage={j.stage} />
                  <p className="mt-1 text-[11px] text-slate-400 font-medium">{j.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Common Journey Paths */}
      <ChartCard title="Top Standard Journey Paths">
        <div className="space-y-2.5">
          {commonJourneyPaths.map((path, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs">
              <span className="font-mono text-slate-700 font-semibold">{path.path}</span>
              <div className="flex items-center gap-4 text-slate-500 font-medium">
                <span className="bg-white px-2 py-1 rounded-md border border-slate-200">{path.count} customers</span>
                <span className="font-bold text-purple-600">{path.conversion}% conv.</span>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Toast Notification Pill matching Image 2 bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300/80 px-4 py-2.5 shadow-xl text-xs font-semibold backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Welcome back! Platform synchronized.</span>
        </div>
      </div>
    </div>
  );
}

