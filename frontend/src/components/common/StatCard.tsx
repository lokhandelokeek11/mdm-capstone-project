import { cn } from "@/lib/utils/cn";
import { formatNumber, formatPercent } from "@/lib/utils/cn";
import type { AnalyticsMetric } from "@/types";
import {
  Users,
  UserCheck,
  Activity,
  Zap,
  ShoppingCart,
  Target,
  RefreshCw,
  UserX,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";

interface StatCardProps {
  metric: AnalyticsMetric;
  className?: string;
}

// Icon and color mappings matching the target UI screenshot
function getMetricVisuals(label: string): { icon: LucideIcon; style: string } {
  const l = label.toLowerCase();
  if (l.includes("total customer") || l.includes("total user")) {
    return { icon: Users, style: "bg-purple-100/90 text-purple-600 border border-purple-200/60" };
  }
  if (l.includes("active customer") || l.includes("active user")) {
    return { icon: UserCheck, style: "bg-pink-100/90 text-pink-600 border border-pink-200/60" };
  }
  if (l.includes("session")) {
    return { icon: Activity, style: "bg-emerald-100/90 text-emerald-600 border border-emerald-200/60" };
  }
  if (l.includes("conversion")) {
    return { icon: Zap, style: "bg-amber-100/90 text-amber-600 border border-amber-200/60" };
  }
  if (l.includes("abandonment") || l.includes("cart")) {
    return { icon: ShoppingCart, style: "bg-rose-100/90 text-rose-600 border border-rose-200/60" };
  }
  if (l.includes("high intent")) {
    return { icon: Target, style: "bg-blue-100/90 text-blue-600 border border-blue-200/60" };
  }
  if (l.includes("repeat") || l.includes("buyer")) {
    return { icon: RefreshCw, style: "bg-indigo-100/90 text-indigo-600 border border-indigo-200/60" };
  }
  if (l.includes("inactive")) {
    return { icon: UserX, style: "bg-orange-100/90 text-orange-600 border border-orange-200/60" };
  }
  return { icon: Activity, style: "bg-purple-100/90 text-purple-600 border border-purple-200/60" };
}

export function StatCard({ metric, className }: StatCardProps) {
  const displayValue =
    metric.format === "percent" ? formatPercent(metric.value) : formatNumber(metric.value);

  const { icon: Icon, style: iconStyle } = getMetricVisuals(metric.label);

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md",
        className,
      )}
    >
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105", iconStyle)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-semibold text-slate-500 truncate">{metric.label}</p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <p className="text-2xl font-black tracking-tight text-slate-900">{displayValue}</p>
          {metric.change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold shrink-0",
                metric.change >= 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-rose-50 text-rose-700 border border-rose-200/60",
              )}
            >
              {metric.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(metric.change)}%</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

