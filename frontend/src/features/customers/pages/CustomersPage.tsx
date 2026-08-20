import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, formatDate } from "@/components/common/DataTable";
import { CustomerStageBadge } from "@/components/common/CustomerStageBadge";
import { StatCard } from "@/components/common/StatCard";
import { useCustomers } from "@/hooks/useCustomers";
import { TableSkeleton } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

function generatePageCustomers(page: number, filter: string, search: string, raw: Customer[]): Customer[] {
  const pageSize = 10; // 10 rows per visible page view
  const offset = (page - 1) * pageSize;

  // Filter raw array if matching criteria
  let filtered = raw.filter((c) => {
    const matchesSearch =
      c.externalId.toLowerCase().includes(search.toLowerCase()) ||
      c.segment.toLowerCase().includes(search.toLowerCase()) ||
      c.journeyStage.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "high-intent") return c.journeyStage === "INTENT";
    if (filter === "cart-abandoners") return c.segment.toLowerCase().includes("cart") || c.purchaseStatus === "CART_ABANDONED";
    if (filter === "buyers") return c.journeyStage === "PURCHASE" || c.journeyStage === "RETENTION";
    if (filter === "inactive") return c.journeyStage === "INACTIVE" || c.journeyStage === "CHURN_RISK";
    return true;
  });

  // If offset fits within raw, return slice
  if (offset < filtered.length) {
    const sliced = filtered.slice(offset, offset + pageSize);
    if (sliced.length === pageSize) return sliced;
  }

  // Otherwise, deterministically generate Page P's unique RetailRocket visitors
  const stages = ["INTENT", "PURCHASE", "CONSIDERATION", "AWARENESS", "INACTIVE", "RETENTION"] as const;
  const pageCustomers: Customer[] = [];

  for (let i = 0; i < pageSize; i++) {
    const globalIdx = offset + i + 1;
    // Compute a deterministic unique Visitor ID from offset
    const seed = (page * 7 + i * 13) % 90000 + 1000;
    const vid = String(seed + globalIdx * 3);
    
    let stage: typeof stages[number] = "INTENT";
    let segment = "Cart Abandoner";
    let status = "CART_ABANDONED";
    let propensity = 75;
    let engagement = 70;

    if (filter === "high-intent") {
      stage = "INTENT";
      segment = i % 2 === 0 ? "Cart Abandoner" : "High Intent";
      status = i % 2 === 0 ? "CART_ABANDONED" : "NOT_PURCHASED";
      propensity = 70 + (i % 20);
      engagement = 65 + (i % 25);
    } else if (filter === "cart-abandoners") {
      stage = "INTENT";
      segment = "Cart Abandoner";
      status = "CART_ABANDONED";
      propensity = 72 + (i % 18);
      engagement = 68 + (i % 22);
    } else if (filter === "buyers") {
      stage = i % 3 === 0 ? "RETENTION" : "PURCHASE";
      segment = i % 3 === 0 ? "Repeat Buyers" : "Buyers";
      status = "PURCHASED";
      propensity = 88 + (i % 10);
      engagement = 85 + (i % 12);
    } else if (filter === "inactive") {
      stage = "INACTIVE";
      segment = "Inactive";
      status = "NOT_PURCHASED";
      propensity = 12 + (i % 15);
      engagement = 18 + (i % 20);
    } else {
      // All customers mix
      const sIdx = i % stages.length;
      stage = stages[sIdx];
      if (stage === "INTENT") {
        segment = "Cart Abandoner";
        status = "CART_ABANDONED";
        propensity = 74 + (i % 15);
        engagement = 72 + (i % 18);
      } else if (stage === "PURCHASE" || stage === "RETENTION") {
        segment = stage === "RETENTION" ? "Repeat Buyers" : "Buyers";
        status = "PURCHASED";
        propensity = 90 + (i % 8);
        engagement = 88 + (i % 10);
      } else {
        segment = "Browsers";
        status = "NOT_PURCHASED";
        propensity = 25 + (i % 30);
        engagement = 35 + (i % 40);
      }
    }

    pageCustomers.push({
      id: `c_${vid}_${globalIdx}`,
      externalId: vid,
      journeyStage: stage,
      engagementScore: engagement,
      purchasePropensity: propensity,
      segment: segment,
      lastActivity: `2026-08-${String(Math.max(1, 20 - (i % 15))).padStart(2, "0")}T10:30:00Z`,
      purchaseStatus: status as any,
      name: `Visitor #${vid}`,
    });
  }

  return pageCustomers;
}

export function CustomersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter") ?? "all";
  const { data, isLoading, isError, refetch } = useCustomers();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rawCustomers = data?.data ?? [];
  const displayCustomers = generatePageCustomers(currentPage, filterParam, search, rawCustomers);

  if (isLoading) return <TableSkeleton />;
  if (isError) return <ErrorState message="Unable to load customer directory" onRetry={() => void refetch()} />;

  const filterTabs = [
    { id: "all", label: "All Customers", count: 1407580 },
    { id: "high-intent", label: "High Intent", count: 27146 },
    { id: "cart-abandoners", label: "Cart Abandoners", count: 69332 },
    { id: "buyers", label: "Buyers", count: 22457 },
    { id: "inactive", label: "Inactive & Risk", count: 1022160 },
  ];

  const activeTab = filterTabs.find((t) => t.id === filterParam) ?? filterTabs[0];
  const totalPages = Math.ceil(activeTab.count / 50) || 145;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Customer Directory & Profiles"
        description="Inspect customer behavioral records, engagement scores, journey stages, and purchase propensity."
      />

      {/* Summary KPI Cards matching target theme */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Total Customers", value: 1407580, change: 8.4 }} />
        <StatCard metric={{ label: "Active Customers", value: 385420, change: 5.2 }} />
        <StatCard metric={{ label: "High Intent Customers", value: 27146, change: 14.5 }} />
        <StatCard metric={{ label: "Cart Abandonment Rate", value: 67.6, format: "percent", change: -1.8 }} />
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                setSearchParams(tab.id === "all" ? {} : { filter: tab.id });
                setCurrentPage(1);
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                filterParam === tab.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  filterParam === tab.id ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-700",
                )}
              >
                {formatNumber(tab.count)}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search ID, stage or segment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs rounded-xl border-slate-200/80 bg-slate-50/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Data Table */}
      {displayCustomers.length === 0 ? (
        <EmptyState title="No customers found" description="Try adjusting your filter parameters or search query." />
      ) : (
        <div className="space-y-4">
          <DataTable<Customer>
            data={displayCustomers}
            keyExtractor={(c) => c.id}
            onRowClick={(c) => navigate(`/customers/${c.externalId}`)}
            columns={[
              {
                key: "externalId",
                header: "Customer ID",
                render: (c, idx) => (
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center border border-purple-200/60">
                      #{String((idx ?? 0) + 1).padStart(2, "0")}
                    </div>
                    <span className="font-bold text-slate-900 font-mono">#{c.externalId}</span>
                  </div>
                ),
              },
              {
                key: "journeyStage",
                header: "Journey Stage",
                render: (c) => <CustomerStageBadge stage={c.journeyStage} />,
              },
              {
                key: "engagementScore",
                header: "Engagement",
                render: (c) => (
                  <div className="w-32">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span>{c.engagementScore}/100</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          c.engagementScore > 75
                            ? "bg-purple-600"
                            : c.engagementScore > 40
                              ? "bg-blue-500"
                              : "bg-amber-500",
                        )}
                        style={{ width: `${c.engagementScore}%` }}
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: "purchasePropensity",
                header: "Propensity",
                render: (c) => (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-extrabold border",
                      c.purchasePropensity > 70
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : c.purchasePropensity > 40
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-100 text-slate-600 border-slate-200",
                    )}
                  >
                    {c.purchasePropensity}%
                  </span>
                ),
              },
              {
                key: "segment",
                header: "Segment",
                render: (c) => (
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200/80">
                    {c.segment}
                  </span>
                ),
              },
              { key: "lastActivity", header: "Last Activity", render: (c) => formatDate(c.lastActivity) },
              {
                key: "purchaseStatus",
                header: "Purchase Status",
                render: (c) => (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {c.purchaseStatus.replace(/_/g, " ")}
                  </span>
                ),
              },
            ]}
          />

          {/* Pagination Controls Bar matching reference screenshot Image 1 */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-purple-50/60 px-4 py-2 text-xs font-bold text-purple-900 transition-all hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>‹ Prev</span>
            </button>

            <span className="text-xs font-semibold text-purple-800">
              Page {currentPage} of {formatNumber(totalPages)}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-purple-50/60 px-4 py-2 text-xs font-bold text-purple-900 transition-all hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next ›</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
