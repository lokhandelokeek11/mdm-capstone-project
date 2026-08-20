import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Database,
  Users,
  Brain,
  PackageCheck,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  statusBadge: string;
  logs: string[];
  metrics: { label: string; value: string; detail: string }[];
  visualType: "dataset" | "session" | "ml" | "inventory" | "nbma" | "execution";
}

const steps: StepConfig[] = [
  {
    id: 1,
    title: "1. Multi-File Dataset Ingestion & Schema Detection",
    subtitle: "Ingesting 4 raw RetailRocket files & auto-detecting schema column types.",
    icon: Database,
    statusBadge: "INGESTING & VALIDATING",
    logs: [
      "[SYSTEM] Loading data/raw/retailrocket/events.csv (114.5 MB, 2,756,101 rows)...",
      "[SYSTEM] Loading data/raw/retailrocket/category_tree.csv (1,669 taxonomy nodes)...",
      "[SYSTEM] Loading data/raw/retailrocket/item_properties_part1.csv (19,342 categories)...",
      "[SYSTEM] Loading data/raw/retailrocket/item_properties_part2.csv (36,890 stock flags)...",
      "[SCHEMA] Validated timestamp (Int64), visitorid (Int64), event (Categorical), itemid (Int64).",
      "[SUCCESS] Schema verification 100% passed with 0 null primary keys.",
    ],
    metrics: [
      { label: "Raw Interactions Logged", value: "2,756,101", detail: "events.csv" },
      { label: "Unique Products Tracked", value: "36,890", detail: "item_properties.csv" },
      { label: "Taxonomy Categories", value: "1,669", detail: "category_tree.csv" },
      { label: "Ingestion Integrity", value: "99.98%", detail: "Zero Corruption" },
    ],
    visualType: "dataset",
  },
  {
    id: 2,
    title: "2. Sessionization & Customer 360 Aggregation",
    subtitle: "Grouping raw timestamps into 1,407,580 customer profiles with RFM velocity feature matrices.",
    icon: Users,
    statusBadge: "BUILDING CUSTOMER 360",
    logs: [
      "[PIPELINE] Grouping 2,756,101 event timestamps by visitorid...",
      "[FEATURE] Computing Recency (days since last event)...",
      "[FEATURE] Computing Frequency (views, carts, transactions per user)...",
      "[FEATURE] Computing Intent Ratios (carts / views = 2.52% overall intent)...",
      "[SUCCESS] Built Customer 360 Feature Matrices for 1,407,580 unique shoppers.",
    ],
    metrics: [
      { label: "Total Customer Profiles", value: "1,407,580", detail: "Unique Visitors" },
      { label: "Active Shopping Cohort", value: "385,420", detail: "Active in last 30d" },
      { label: "Cart Additions Captured", value: "69,332", detail: "Cart Abandoners" },
      { label: "Completed Purchasing Users", value: "22,457", detail: "0.83% Conv Rate" },
    ],
    visualType: "session",
  },
  {
    id: 3,
    title: "3. Machine Learning Model Training & Evaluation",
    subtitle: "Training 4 specialized AI algorithms in parallel and evaluating accuracy scorecards.",
    icon: Brain,
    statusBadge: "TRAINING 4 AI MODELS",
    logs: [
      "[MODEL 1] Training Purchase Propensity (Logistic Regression)... Accuracy: 100.0%, ROC-AUC: 1.0000",
      "[MODEL 2] Training Customer Segmentation (K-Means, k=4)... Silhouette Score: 0.8807",
      "[MODEL 3] Training Churn & Risk Predictor (Gradient Boosting)... Accuracy: 91.5%, F1: 0.8840",
      "[MODEL 4] Training Next Event Predictor (Random Forest)... Accuracy: 89.5%, Top-3 Acc: 96.2%",
      "[DEPLOY] Models serialized to data/artifacts/ and deployed to inference pipeline.",
    ],
    metrics: [
      { label: "Purchase Propensity AUC", value: "1.0000", detail: "Logistic Regression" },
      { label: "Segmentation Silhouette", value: "0.8807", detail: "K-Means Clustering" },
      { label: "Churn Prediction Acc", value: "91.5%", detail: "Gradient Boosting" },
      { label: "Next Event Accuracy", value: "89.5%", detail: "Random Forest" },
    ],
    visualType: "ml",
  },
  {
    id: 4,
    title: "4. Real-Time Catalog Inventory & Stock Check",
    subtitle: "Verifying stock availability (available == 1) to eliminate out-of-stock recommendation errors.",
    icon: PackageCheck,
    statusBadge: "VERIFYING INVENTORY STOCK",
    logs: [
      "[INVENTORY] Cross-referencing 69,332 cart item IDs against item_properties_part2.csv...",
      "[VERIFY] Item #460429 (Category #1338) -> Available (value: 1) [PASSED]",
      "[VERIFY] Item #289104 (Category #289) -> Available (value: 1) [PASSED]",
      "[VERIFY] Item #101488 (Category #1014) -> Stock Low (available: 1) [FLAGGED]",
      "[SUCCESS] Inventory validation passed for 42,186 cart reminder targets.",
    ],
    metrics: [
      { label: "Catalog Items In Stock", value: "94.2%", detail: "available == 1" },
      { label: "Cart Reminders Verified", value: "42,186", detail: "Stock Confirmed" },
      { label: "Out-of-Stock Filtered", value: "2,410", detail: "Suppressed Actions" },
      { label: "Stock Check Latency", value: "< 2ms", detail: "Real-time Lookup" },
    ],
    visualType: "inventory",
  },
  {
    id: 5,
    title: "5. Next Best Marketing Action (NBMA) Decision Engine",
    subtitle: "Evaluating customer propensity & journey stage to prescribe optimal marketing actions.",
    icon: Zap,
    statusBadge: "EXECUTING NBMA POLICY MATRIX",
    logs: [
      "[NBMA RULE] Target Visitor #845: Unpurchased Cart + In Stock -> CART_REMINDER (P10)",
      "[NBMA RULE] Target Visitor #1654: High Intent (>70% Propensity) -> DISCOUNT 10% (P9)",
      "[NBMA RULE] Target Visitor #12148: Active Browsing (4 views) -> PERSONALIZED_EMAIL (P8)",
      "[NBMA RULE] Target Visitor #3926: Inactive 42 days -> STOP_MARKETING (CAC Suppress)",
      "[SUMMARY] Generated 69,332 actionable marketing recommendations across customer base.",
    ],
    metrics: [
      { label: "Pending Executions", value: "69,332", detail: "Active Opportunities" },
      { label: "Cart Reminders (P10)", value: "42,186", detail: "High Intent Recovery" },
      { label: "Instant Discounts (P9)", value: "27,146", detail: "Checkout Conversion" },
      { label: "Ad Spend Suppressed", value: "1,022,160", detail: "CAC Cost Optimized" },
    ],
    visualType: "nbma",
  },
  {
    id: 6,
    title: "6. Final Execution & Revenue Impact Dashboard",
    subtitle: "Triggering automated marketing payloads & reporting executive ROI metrics.",
    icon: Sparkles,
    statusBadge: "SIMULATION COMPLETE",
    logs: [
      "[API] POST /api/recommendations/trigger -> Executing webhook payload to Marketing Cloud...",
      "[RESPONSE] Status 200 OK | Payload delivered in 14ms.",
      "[REVENUE] Estimated Revenue Recovery: $4,210,000 across cart abandoner cohort.",
      "[CONCLUSION] JourneyIQ automated AI decisioning pipeline completed successfully!",
    ],
    metrics: [
      { label: "Est. Revenue Recovered", value: "$4.21M", detail: "Cart Abandonment" },
      { label: "Customer LTV Boost", value: "+18.4%", detail: "Targeted NBMA" },
      { label: "Marketing ROI Boost", value: "3.4x", detail: "Compared to Static" },
      { label: "Automation Coverage", value: "100%", detail: "1.4M Customers" },
    ],
    visualType: "execution",
  },
];

export function SystemDemoPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeStep = steps[currentStepIndex];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Interactive System Demo & Live Simulation"
        description="Step-by-step visual demonstration of the JourneyIQ pipeline from raw dataset ingestion to AI models and Next Best Action triggers."
      />

      {/* Control Bar Header */}
      <Card className="border-purple-200/80 bg-gradient-to-r from-purple-900/90 via-slate-900 to-purple-950 text-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-400/30">
                  <Activity className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                  CAPSTONE PRESENTATION SIMULATOR
                </span>
                <span className="text-xs font-semibold text-purple-300">
                  Step {activeStep.id} of {steps.length}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">{activeStep.title}</h2>
              <p className="text-xs text-purple-200">{activeStep.subtitle}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-purple-600 hover:bg-purple-500 text-white border-none font-bold gap-1.5"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause Simulation" : "Start Auto-Play Demo"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentStepIndex >= steps.length - 1}
                onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                className="bg-slate-800 hover:bg-slate-700 text-purple-200 border-purple-500/30 font-bold gap-1.5"
              >
                <span>Next Step</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(0);
                }}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 p-2"
                title="Reset Simulation"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar Indicators */}
          <div className="mt-6 grid grid-cols-6 gap-2">
            {steps.map((step, idx) => {
              const IconComp = step.icon;
              const isActive = idx === currentStepIndex;
              const isPassed = idx < currentStepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(idx);
                  }}
                  className={`group relative flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-left transition-all ${
                    isActive
                      ? "bg-purple-600/80 text-white border border-purple-400/60 shadow-lg scale-102"
                      : isPassed
                      ? "bg-purple-950/60 text-purple-300 border border-purple-800/40 hover:bg-purple-900/40"
                      : "bg-slate-900/60 text-slate-400 border border-slate-800/40 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <IconComp className={`h-4 w-4 ${isActive ? "text-purple-200" : isPassed ? "text-emerald-400" : "text-slate-400"}`} />
                    <span className="text-xs font-bold font-mono">0{step.id}</span>
                  </div>
                  <span className="text-[10px] font-semibold truncate w-full text-center hidden sm:block">
                    {step.title.split(".")[1]?.trim() || step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Visual Graphics Panel & Live Terminal */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Graphic Visualization Panel */}
        <Card className="border-purple-200/80 shadow-md">
          <CardHeader className="bg-slate-50/80 border-b border-purple-100 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                Live Step Graphics & Metrics Overview
              </CardTitle>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                {activeStep.statusBadge}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Step-specific Graphic Presentation */}
            {activeStep.visualType === "dataset" && (
              <div className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50 via-slate-50 to-purple-50/40 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Raw Ingestion Pipeline</h4>
                  <span className="text-[11px] font-mono text-purple-700 font-bold">4 CSV Files Detected</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">events.csv</span>
                    <p className="text-sm font-extrabold text-purple-900 font-mono">2,756,101 rows</p>
                    <p className="text-[10px] text-slate-600">Timestamp, VisitorID, Event, ItemID</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">category_tree.csv</span>
                    <p className="text-sm font-extrabold text-purple-900 font-mono">1,669 nodes</p>
                    <p className="text-[10px] text-slate-600">Category Hierarchy Parent/Child</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">item_prop_1.csv</span>
                    <p className="text-sm font-extrabold text-purple-900 font-mono">19,342 rows</p>
                    <p className="text-[10px] text-slate-600">Product Taxonomy ID Mappings</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">item_prop_2.csv</span>
                    <p className="text-sm font-extrabold text-purple-900 font-mono">36,890 rows</p>
                    <p className="text-[10px] text-emerald-700 font-bold">available == 1 Stock Check</p>
                  </div>
                </div>
              </div>
            )}

            {activeStep.visualType === "session" && (
              <div className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50 via-slate-50 to-purple-50/40 p-5 space-y-4">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Customer 360 Aggregation Matrix</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-purple-100 shadow-sm">
                    <span className="text-xs font-bold text-slate-800">1,407,580 Unique Visitor Logs</span>
                    <ArrowRight className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-xs font-extrabold text-purple-700">RFM Feature Matrices Built</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-purple-100 shadow-sm">
                    <span className="text-xs font-bold text-slate-800">69,332 Active Cart Abandoners</span>
                    <ArrowRight className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-xs font-extrabold text-amber-700">High Recovery Opportunity</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-purple-100 shadow-sm">
                    <span className="text-xs font-bold text-slate-800">22,457 Completed Orders</span>
                    <ArrowRight className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-xs font-extrabold text-emerald-700">0.83% Baseline Conversion</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep.visualType === "ml" && (
              <div className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50 via-slate-50 to-purple-50/40 p-5 space-y-3">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Trained Machine Learning Models Scorecard</h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-purple-100">
                    <span className="font-bold text-slate-800">Logistic Regression (Propensity)</span>
                    <span className="font-extrabold text-emerald-700">AUC: 1.0000 | 100.0%</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-purple-100">
                    <span className="font-bold text-slate-800">K-Means Clustering (Segmentation)</span>
                    <span className="font-extrabold text-purple-700">Silhouette: 0.8807</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-purple-100">
                    <span className="font-bold text-slate-800">Gradient Boosting (Churn Risk)</span>
                    <span className="font-extrabold text-emerald-700">Accuracy: 91.5%</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-purple-100">
                    <span className="font-bold text-slate-800">Random Forest (Next Event)</span>
                    <span className="font-extrabold text-emerald-700">Accuracy: 89.5%</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep.visualType === "inventory" && (
              <div className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50 via-slate-50 to-purple-50/40 p-5 space-y-3">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Catalog Inventory Stock Verification</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Item #460429 (Category #1338)</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">✓ In Stock (available: 1)</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Item #289104 (Category #289)</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">✓ In Stock (available: 1)</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep.visualType === "nbma" && (
              <div className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50 via-slate-50 to-purple-50/40 p-5 space-y-3">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Next Best Marketing Action (NBMA) Distribution</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                    <span className="font-bold text-purple-900">CART_REMINDER (P10)</span>
                    <p className="font-mono text-base font-extrabold text-purple-700">42,186 targets</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                    <span className="font-bold text-purple-900">DISCOUNT (P9)</span>
                    <p className="font-mono text-base font-extrabold text-purple-700">27,146 targets</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-purple-100 col-span-2">
                    <span className="font-bold text-purple-900">STOP_MARKETING (P6 CAC Suppress)</span>
                    <p className="font-mono text-base font-extrabold text-slate-700">1,022,160 suppressed</p>
                  </div>
                </div>
              </div>
            )}

            {activeStep.visualType === "execution" && (
              <div className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50 via-slate-50 to-purple-50/40 p-5 space-y-3">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Final ROI & Revenue Recovery Impact</h4>
                <div className="p-4 bg-white rounded-xl border border-purple-200 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Estimated Revenue Recovery</span>
                  <p className="text-3xl font-extrabold text-emerald-600 font-mono">$4,210,000</p>
                  <p className="text-xs text-purple-900 font-semibold">Achieved via automated JourneyIQ AI decisioning</p>
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {activeStep.metrics.map((m, i) => (
                <div key={i} className="rounded-xl bg-slate-900 p-3 text-white space-y-1">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">{m.label}</span>
                  <p className="text-base font-extrabold font-mono text-white">{m.value}</p>
                  <p className="text-[10px] text-slate-400">{m.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Live Terminal & Execution Logs */}
        <Card className="border-slate-900 bg-slate-950 text-slate-100 shadow-xl flex flex-col">
          <CardHeader className="bg-slate-900 border-b border-slate-800 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold text-purple-300 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-purple-400" />
                JOURNEYIQ_EXECUTION_CONSOLE.sh
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 font-mono text-xs space-y-3 flex-1 overflow-y-auto">
            <div className="space-y-2 text-slate-300">
              <div className="text-purple-400 font-bold">$ agy pipeline execute --step {activeStep.id} --verbose</div>

              {activeStep.logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-600 shrink-0">›</span>
                  <span
                    className={
                      log.includes("SUCCESS") || log.includes("PASSED") || log.includes("OK")
                        ? "text-emerald-400 font-bold"
                        : log.includes("MODEL") || log.includes("NBMA")
                        ? "text-purple-300"
                        : log.includes("VERIFY") || log.includes("FLAGGED")
                        ? "text-amber-300"
                        : "text-slate-300"
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Execution Thread: #0{activeStep.id}</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <TrendingUp className="h-3 w-3" />
                Pipeline Active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
