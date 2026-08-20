import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs border-l-4 border-l-purple-600",
        className,
      )}
    >
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-xs font-medium text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}

