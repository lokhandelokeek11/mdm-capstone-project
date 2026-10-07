import { useQuery } from "@tanstack/react-query";
import { modelsApi } from "@/lib/api/modelsApi";

function MetricTable({ title, rows }: { title: string; rows: Record<string, unknown>[] }) {
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {cols.map((c) => (
                <th key={c} className="px-2 py-1 text-left font-semibold text-slate-600 dark:text-slate-300">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                {cols.map((c) => (
                  <td key={c} className="px-2 py-1 text-slate-800 dark:text-slate-200">
                    {String(row[c] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ResearchQuestionsPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ml-research"],
    queryFn: async () => modelsApi.research(),
    staleTime: 60_000,
  });

  const research = data?.data;

  if (isLoading) {
    return (
      <p className="text-sm text-slate-500">Loading measured research results from RetailRocket evaluation…</p>
    );
  }
  if (isError || !research) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Run <code className="font-mono">python ml/train_models.py</code> to generate{" "}
        <code className="font-mono">data/artifacts/research_results.json</code>, then refresh.
      </p>
    );
  }

  const rq1 = research.RQ1_next_event as Record<string, Record<string, number | string>> | undefined;
  const rq3 = research.RQ3_propensity as Record<string, unknown> | undefined;
  const rq4 = research.RQ4_strategy_simulation as Record<string, Record<string, unknown>> | undefined;
  const cohort = research.cohort as Record<string, number> | undefined;

  const rq1Rows = rq1
    ? ["markov", "logistic_regression", "random_forest", "xgboost", "gru"]
        .filter((k) => rq1[k])
        .map((k) => ({ model: k, ...(rq1[k] as object) }))
    : [];

  const rq3Static = (rq3?.static as Record<string, Record<string, number>>) ?? {};
  const rq3Journey = (rq3?.journey_aware as Record<string, Record<string, number>>) ?? {};
  const rq3Rows = [
    ...Object.entries(rq3Static).map(([model, m]) => ({ feature_set: "static", model, ...m })),
    ...Object.entries(rq3Journey).map(([model, m]) => ({ feature_set: "journey_aware", model, ...m })),
  ];

  const rq4Rows = rq4
    ? Object.entries(rq4)
        .filter(([k]) => !["winner"].includes(k))
        .map(([strategy, m]) => ({ strategy, ...(m as object) }))
    : [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        <strong>Measured offline study</strong> — chronological 80/20 cutoff on RetailRocket (
        {cohort?.n_visitors?.toLocaleString() ?? "?"} visitors, {cohort?.n_events?.toLocaleString() ?? "?"} events).
        Champion next-event: <strong>{String(rq1?.champion ?? "—")}</strong>. Champion propensity:{" "}
        <strong>{String((research.RQ3_champion as { model?: string })?.model ?? "—")}</strong> (
        {(research.RQ3_champion as { feature_set?: string })?.feature_set ?? "—"} features). RQ4 winner:{" "}
        <strong>{String(rq4?.winner ?? "—")}</strong>.
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <MetricTable title="RQ1 — Next-event prediction (macro-F1 comparison)" rows={rq1Rows} />
        <MetricTable title="RQ3 — Propensity (static vs journey-aware)" rows={rq3Rows} />
      </div>
      <MetricTable title="RQ4 — Strategy simulation (proxy metrics)" rows={rq4Rows} />

      {(() => {
        const secX = research.section_x_journey_funnel_analytics as {
          funnel?: { stages?: { stage: string; count: number; pct_of_cohort: number }[] };
          journey_stage_distribution?: { stage: string; count: number; pct: number }[];
        } | undefined;
        const funnelRows =
          secX?.funnel?.stages?.map((s) => ({
            stage: s.stage,
            count: s.count,
            pct: `${(s.pct_of_cohort * 100).toFixed(2)}%`,
          })) ?? [];
        const stageRows = secX?.journey_stage_distribution ?? [];
        return (
          <>
            <MetricTable title="Sec. X — Visitor funnel (pre-cutoff, paper figure data)" rows={funnelRows} />
            <MetricTable title="Sec. X — Journey stage distribution" rows={stageRows} />
          </>
        );
      })()}
    </div>
  );
}
