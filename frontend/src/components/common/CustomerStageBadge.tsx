import { cn } from "@/lib/utils/cn";

const stageStyles: Record<string, string> = {
  AWARENESS: "bg-blue-50 text-blue-700 border-blue-200/80",
  CONSIDERATION: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
  INTENT: "bg-amber-50 text-amber-700 border-amber-200/80",
  PURCHASE: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  RETENTION: "bg-purple-50 text-purple-700 border-purple-200/80",
  CHURN_RISK: "bg-rose-50 text-rose-700 border-rose-200/80",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200/80",
};

interface CustomerStageBadgeProps {
  stage: string;
  className?: string;
}

export function CustomerStageBadge({ stage, className }: CustomerStageBadgeProps) {
  const style = stageStyles[stage] ?? "bg-slate-100 text-slate-700 border-slate-200";
  const label = stage.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide border shadow-2xs uppercase",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}

