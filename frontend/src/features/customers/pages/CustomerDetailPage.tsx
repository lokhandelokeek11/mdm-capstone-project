import { useParams, Link } from "react-router-dom";
import { CustomerStageBadge } from "@/components/common/CustomerStageBadge";
import { JourneyTimeline } from "@/components/common/JourneyTimeline";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCustomer } from "@/hooks/useCustomers";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ArrowLeft, Lightbulb, Zap, User, Target, CheckCircle2 } from "lucide-react";

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useCustomer(id ?? "");

  if (isLoading) return <LoadingState rows={6} />;
  if (isError || !data?.data) return <ErrorState message="Unable to load customer profile" onRetry={() => void refetch()} />;

  const customer = data.data;

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Customer Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild className="rounded-xl border-slate-200 text-xs font-semibold">
          <Link to="/customers">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Directory
          </Link>
        </Button>
      </div>

      {/* Customer Hero Banner Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xl font-extrabold text-white shadow-md">
            #{customer.externalId.slice(-2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight">Customer #{customer.externalId}</h1>
              <CustomerStageBadge stage={customer.journeyStage} />
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Segment: <span className="text-purple-300 font-bold">{customer.segment}</span> • Last Activity: {new Date(customer.lastActivity).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2 text-right border border-white/10">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Purchase Status</p>
            <p className="text-xs font-extrabold text-emerald-400">{customer.purchaseStatus.replace(/_/g, " ")}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Engagement Score", value: customer.engagementScore, change: 5.4 }} />
        <StatCard metric={{ label: "Purchase Propensity", value: customer.purchasePropensity, format: "percent", change: 12.0 }} />
        <StatCard metric={{ label: "Total Sessions", value: customer.sessions }} />
        <StatCard metric={{ label: "Cart Abandonment Rate", value: customer.cartAdditions > 0 ? 50 : 0, format: "percent" }} />
      </div>

      {/* Behavioral Summary & Prediction Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              Behavioral Metrics Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <dt className="text-slate-500 font-medium">Sessions Recorded</dt>
                <dd className="mt-1 text-lg font-black text-slate-900">{customer.sessions}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <dt className="text-slate-500 font-medium">Product Views</dt>
                <dd className="mt-1 text-lg font-black text-slate-900">{customer.views}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <dt className="text-slate-500 font-medium">Cart Additions</dt>
                <dd className="mt-1 text-lg font-black text-amber-600">{customer.cartAdditions}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <dt className="text-slate-500 font-medium">Purchases Completed</dt>
                <dd className="mt-1 text-lg font-black text-emerald-600">{customer.purchases}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <dt className="text-slate-500 font-medium">Unique Products</dt>
                <dd className="mt-1 text-lg font-black text-slate-900">{customer.uniqueProducts}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <dt className="text-slate-500 font-medium">Last Event Date</dt>
                <dd className="mt-1 text-xs font-bold text-slate-800">{new Date(customer.lastActivity).toLocaleDateString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              ML Prediction & Next Best Marketing Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50/60 p-3.5">
              <div>
                <p className="text-slate-500 font-semibold">Predicted Next Event</p>
                <p className="mt-0.5 text-sm font-black text-purple-700">
                  {String(customer.predictedNextEvent).replace(/_/g, " ")}
                </p>
              </div>
              <span className="rounded-lg bg-purple-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase">
                High Confidence
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 p-3.5">
              <div>
                <p className="text-slate-500 font-semibold">Recommended Action (NBMA)</p>
                <p className="mt-0.5 text-sm font-black text-amber-700">
                  {String(customer.recommendedAction).replace(/_/g, " ")}
                </p>
              </div>
              <span className="rounded-lg bg-amber-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase">
                Action Ready
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-slate-500 font-semibold">Action Rationale & Trigger Reasons:</p>
              <ul className="space-y-1.5">
                {customer.recommendationReasons.map((reason, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-slate-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Flow Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Chronological Journey Events Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <JourneyTimeline events={customer.journeyEvents} />
        </CardContent>
      </Card>

      {/* AI/ML Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Explainable AI/ML Behavioral Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {customer.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs font-medium text-slate-700">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-purple-600 shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

