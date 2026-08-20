import { cn } from "@/lib/utils/cn";
import type { JourneyEvent } from "@/types";
import { ArrowRight } from "lucide-react";

interface JourneyTimelineProps {
  events: JourneyEvent[];
  className?: string;
}

const eventVisuals: Record<string, { label: string; style: string }> = {
  PRODUCT_VIEW: { label: "Product View", style: "bg-blue-50 text-blue-700 border-blue-200" },
  SEARCH: { label: "Search", style: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  CLICK: { label: "Click", style: "bg-sky-50 text-sky-700 border-sky-200" },
  FAVORITE: { label: "Favorite", style: "bg-pink-50 text-pink-700 border-pink-200" },
  ADD_TO_CART: { label: "Add to Cart", style: "bg-amber-50 text-amber-700 border-amber-200" },
  REMOVE_FROM_CART: { label: "Remove Cart", style: "bg-rose-50 text-rose-700 border-rose-200" },
  PURCHASE: { label: "Purchase", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EMAIL_CLICK: { label: "Email Click", style: "bg-purple-50 text-purple-700 border-purple-200" },
  AD_CLICK: { label: "Ad Click", style: "bg-purple-50 text-purple-700 border-purple-200" },
  SESSION_START: { label: "Session Start", style: "bg-slate-100 text-slate-700 border-slate-200" },
  SESSION_END: { label: "Return Visit", style: "bg-teal-50 text-teal-700 border-teal-200" },
};

export function JourneyTimeline({ events, className }: JourneyTimelineProps) {
  if (events.length === 0) {
    return <p className="text-xs text-slate-400 font-medium">No journey events recorded.</p>;
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-start gap-y-4 gap-x-3 py-2", className)}>
      {events.map((event, index) => {
        const visual = eventVisuals[event.eventType] ?? {
          label: event.label ?? event.eventType,
          style: "bg-slate-100 text-slate-700 border-slate-200",
        };

        return (
          <div key={event.id} className="flex items-center gap-3">
            <div className={cn("relative flex flex-col items-center rounded-2xl border p-3 min-w-[140px] text-center shadow-2xs transition-all hover:scale-105", visual.style)}>
              <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-black text-white shadow-xs">
                #{index + 1}
              </span>
              <span className="text-xs font-bold">{visual.label}</span>
              {event.productName && (
                <span className="mt-0.5 text-[10px] opacity-80 truncate max-w-[130px] font-medium">{event.productName}</span>
              )}
            </div>
            {index < events.length - 1 && (
              <ArrowRight className="h-4 w-4 text-purple-400 shrink-0" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}

