import { useState, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable } from "@/components/common/DataTable";
import {
  Cpu,
  Sparkles,
  TrendingUp,
  Activity,
  BarChart2,
  Sliders,
  Zap,
  Play,
  RefreshCw,
  Layers,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// Model Data Definitions
export interface DetailedModel {
  id: string;
  name: string;
  architecture: string;
  framework: string;
  version: string;
  status: "CHAMPION" | "CHALLENGER" | "READY" | "TRAINING";
  accuracy: string;
  rocAuc: number;
  precision: number;
  recall: number;
  f1Score: number;
  logLoss: number;
  inferenceTimeMs: number;
  trainedAt: string;
  description: string;
  confusionMatrix: {
    tp: number;
    fp: number;
    fn: number;
    tn: number;
  };
  features: { feature: string; importance: number }[];
  lossHistory: { epoch: number; trainLoss: number; valLoss: number }[];
  rocCurve: { fpr: number; tpr: number }[];
  hyperparameters: Record<string, string | number>;
}

const MODELS_DATA: DetailedModel[] = [
  {
    id: "propensity-xgboost",
    name: "Purchase Propensity Predictor",
    architecture: "XGBoost Gradient Boosted Trees",
    framework: "XGBoost 2.0.3 / Scikit-Learn",
    version: "v2.4.0 (Production Champion)",
    status: "CHAMPION",
    accuracy: "94.2%",
    rocAuc: 0.928,
    precision: 0.915,
    recall: 0.898,
    f1Score: 0.906,
    logLoss: 0.214,
    inferenceTimeMs: 12.4,
    trainedAt: "2026-08-20 Date (5-Fold CV)",
    description: "Predicts the 7-day conversion probability of active web/mobile sessions based on real-time event sequences.",
    confusionMatrix: { tp: 1420, fp: 110, fn: 160, tn: 8310 },
    features: [
      { feature: "View-to-Cart Ratio", importance: 0.28 },
      { feature: "Session Time Decay", importance: 0.22 },
      { feature: "Cart Addition Count", importance: 0.18 },
      { feature: "Days Since Last Visit", importance: 0.14 },
      { feature: "Search Intent Depth", importance: 0.10 },
      { feature: "Past 30d Orders", importance: 0.08 },
    ],
    lossHistory: Array.from({ length: 20 }, (_, i) => ({
      epoch: (i + 1) * 5,
      trainLoss: parseFloat((0.68 * Math.exp(-i * 0.18) + 0.12).toFixed(3)),
      valLoss: parseFloat((0.71 * Math.exp(-i * 0.16) + 0.15 + Math.random() * 0.01).toFixed(3)),
    })),
    rocCurve: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.05, tpr: 0.42 },
      { fpr: 0.1, tpr: 0.72 },
      { fpr: 0.15, tpr: 0.86 },
      { fpr: 0.25, tpr: 0.92 },
      { fpr: 0.4, tpr: 0.96 },
      { fpr: 0.6, tpr: 0.98 },
      { fpr: 1.0, tpr: 1.0 },
    ],
    hyperparameters: {
      max_depth: 6,
      learning_rate: 0.03,
      n_estimators: 350,
      subsample: 0.8,
      colsample_bytree: 0.8,
      scale_pos_weight: 2.5,
      eval_metric: "logloss",
    },
  },
  {
    id: "churn-lgbm",
    name: "Customer Churn Risk Classifier",
    architecture: "LightGBM + Random Forest Ensemble",
    framework: "LightGBM 4.1.0 / PyCaret",
    version: "v1.8.2 (Challenger)",
    status: "CHALLENGER",
    accuracy: "91.5%",
    rocAuc: 0.912,
    precision: 0.887,
    recall: 0.921,
    f1Score: 0.904,
    logLoss: 0.248,
    inferenceTimeMs: 14.8,
    trainedAt: "2026-08-19 Date (5-Fold CV)",
    description: "Detects early churn signals, inactivity risks, and decreasing engagement trends before customer loss.",
    confusionMatrix: { tp: 890, fp: 113, fn: 76, tn: 8921 },
    features: [
      { feature: "Days Since Last Visit", importance: 0.35 },
      { feature: "Session Frequency Drop", importance: 0.25 },
      { feature: "Support Ticket Count", importance: 0.18 },
      { feature: "Email Open Rate Decay", importance: 0.12 },
      { feature: "Order Value Trend", importance: 0.10 },
    ],
    lossHistory: Array.from({ length: 20 }, (_, i) => ({
      epoch: (i + 1) * 5,
      trainLoss: parseFloat((0.72 * Math.exp(-i * 0.15) + 0.14).toFixed(3)),
      valLoss: parseFloat((0.74 * Math.exp(-i * 0.14) + 0.18).toFixed(3)),
    })),
    rocCurve: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.08, tpr: 0.38 },
      { fpr: 0.14, tpr: 0.68 },
      { fpr: 0.2, tpr: 0.83 },
      { fpr: 0.32, tpr: 0.90 },
      { fpr: 0.5, tpr: 0.95 },
      { fpr: 1.0, tpr: 1.0 },
    ],
    hyperparameters: {
      num_leaves: 31,
      learning_rate: 0.05,
      n_estimators: 400,
      min_child_samples: 20,
      feature_fraction: 0.8,
      boosting_type: "gbdt",
    },
  },
  {
    id: "segmentation-kmeans",
    name: "Behavioral RFM Clustering",
    architecture: "K-Means++ & HDBSCAN Density",
    framework: "Scikit-Learn 1.4 / UMAP",
    version: "v3.1.0 (Production)",
    status: "READY",
    accuracy: "89.3%",
    rocAuc: 0.895,
    precision: 0.879,
    recall: 0.891,
    f1Score: 0.885,
    logLoss: 0.295,
    inferenceTimeMs: 9.6,
    trainedAt: "2026-08-18 Date",
    description: "Groups customers into 5 distinct behavioral segments based on recency, frequency, monetary, and intent traits.",
    confusionMatrix: { tp: 2100, fp: 240, fn: 190, tn: 7470 },
    features: [
      { feature: "Monetary Lifetime Value", importance: 0.32 },
      { feature: "Purchase Frequency", importance: 0.27 },
      { feature: "Recency (Days)", importance: 0.21 },
      { feature: "Browse Depth", importance: 0.12 },
      { feature: "Discount Sensitivity", importance: 0.08 },
    ],
    lossHistory: Array.from({ length: 20 }, (_, i) => ({
      epoch: (i + 1) * 5,
      trainLoss: parseFloat((0.85 * Math.exp(-i * 0.12) + 0.22).toFixed(3)),
      valLoss: parseFloat((0.88 * Math.exp(-i * 0.11) + 0.25).toFixed(3)),
    })),
    rocCurve: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.1, tpr: 0.45 },
      { fpr: 0.2, tpr: 0.72 },
      { fpr: 0.35, tpr: 0.85 },
      { fpr: 0.55, tpr: 0.93 },
      { fpr: 1.0, tpr: 1.0 },
    ],
    hyperparameters: {
      n_clusters: 5,
      init: "k-means++",
      max_iter: 500,
      random_state: 42,
      algorithm: "elkan",
    },
  },
  {
    id: "nba-dnn",
    name: "Next Event & Best Action Model",
    architecture: "Multi-Task Deep Neural Network (DNN)",
    framework: "PyTorch 2.2 / Contextual Bandits",
    version: "v2.0.1 (Production)",
    status: "READY",
    accuracy: "89.5%",
    rocAuc: 0.908,
    precision: 0.892,
    recall: 0.876,
    f1Score: 0.884,
    logLoss: 0.262,
    inferenceTimeMs: 16.5,
    trainedAt: "2026-08-17 Date",
    description: "Recommends the optimal next marketing action (discount, nudge, email, wait) per customer touchpoint.",
    confusionMatrix: { tp: 1750, fp: 180, fn: 210, tn: 7860 },
    features: [
      { feature: "Last Event Type", importance: 0.32 },
      { feature: "Journey Stage Depth", importance: 0.24 },
      { feature: "Time Spent on Checkout", importance: 0.20 },
      { feature: "Price Sensitivity Score", importance: 0.14 },
      { feature: "Previous Action Response", importance: 0.10 },
    ],
    lossHistory: Array.from({ length: 20 }, (_, i) => ({
      epoch: (i + 1) * 5,
      trainLoss: parseFloat((0.82 * Math.exp(-i * 0.14) + 0.18).toFixed(3)),
      valLoss: parseFloat((0.85 * Math.exp(-i * 0.13) + 0.21).toFixed(3)),
    })),
    rocCurve: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.07, tpr: 0.40 },
      { fpr: 0.15, tpr: 0.74 },
      { fpr: 0.25, tpr: 0.86 },
      { fpr: 0.45, tpr: 0.94 },
      { fpr: 1.0, tpr: 1.0 },
    ],
    hyperparameters: {
      hidden_layers: "[256, 128, 64]",
      activation: "ReLU",
      dropout: 0.2,
      optimizer: "AdamW",
      learning_rate: 0.001,
      batch_size: 128,
    },
  },
];

export function ModelsPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>("propensity-xgboost");
  const [isRetraining, setIsRetraining] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Live Simulator state
  const [simViews, setSimViews] = useState(8);
  const [simCarts, setSimCarts] = useState(3);
  const [simDays, setSimDays] = useState(2);
  const [simDuration, setSimDuration] = useState(14);
  const [simResult, setSimResult] = useState<{
    propensity: number;
    stage: string;
    action: string;
  } | null>(null);

  const selectedModel = useMemo(
    () => MODELS_DATA.find((m) => m.id === selectedModelId) || MODELS_DATA[0],
    [selectedModelId],
  );

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 1800);
  };

  const handleRunSim = () => {
    // Calculate synthetic propensity score based on sliders
    const score = Math.min(
      0.98,
      Math.max(
        0.12,
        (simViews * 0.04 + simCarts * 0.22 + simDuration * 0.015 - simDays * 0.08) / 1.5 + 0.35,
      ),
    );
    let stage = "Consideration";
    let action = "Send Browsing Nudge Email";

    if (score > 0.75) {
      stage = "High Intent Purchase";
      action = "Trigger 10% Immediate Checkout Discount";
    } else if (score < 0.35) {
      stage = "Awareness / Casual";
      action = "Display Popular Products Banner";
    }

    setSimResult({
      propensity: parseFloat((score * 100).toFixed(1)),
      stage,
      action,
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast notification for retraining simulation */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-3.5 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Model Pipeline Re-evaluated!</p>
            <p className="text-[11px] text-slate-400">
              Validated on 5-Fold Cross-Validation dataset with +0.4% AUC boost.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Machine Learning Models & Evaluation Experiments"
          description="Detailed cross-validation evaluations, ROC-AUC curves, confusion matrices, feature attribution, and hyperparameter logs for Customer Journey Intelligence."
        />
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:bg-purple-700 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isRetraining ? "animate-spin" : ""}`} />
            {isRetraining ? "Running 5-Fold Cross Validation..." : "Re-Evaluate Pipeline"}
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          metric={{
            label: "Best Model ROC-AUC",
            value: 0.928,
            format: "number",
            change: 1.4,
          }}
        />
        <StatCard
          metric={{
            label: "Avg Model Accuracy",
            value: 91.8,
            format: "percent",
            change: 0.8,
          }}
        />
        <StatCard
          metric={{
            label: "Active Production Pipelines",
            value: 4,
          }}
        />
        <StatCard
          metric={{
            label: "Avg Real-Time Latency",
            value: 13.3,
          }}
        />
      </div>

      {/* Model Selector Tabs */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
        <div className="text-xs font-bold text-slate-400 px-3 pt-2 pb-1.5 uppercase tracking-wider">
          Select Trained Model Pipeline to Inspect Evaluation Metrics:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {MODELS_DATA.map((m) => {
            const isSelected = m.id === selectedModelId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedModelId(m.id)}
                className={`flex flex-col text-left p-3.5 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-purple-900 text-white border-purple-800 shadow-md ring-2 ring-purple-500/30"
                    : "bg-slate-50/70 text-slate-700 border-slate-200/60 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      isSelected
                        ? "bg-purple-800 text-purple-200"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    {m.status}
                  </span>
                  <span
                    className={`text-xs font-extrabold font-mono ${
                      isSelected ? "text-purple-300" : "text-purple-600"
                    }`}
                  >
                    AUC {m.rocAuc}
                  </span>
                </div>
                <p
                  className={`mt-2 font-bold text-xs line-clamp-1 ${
                    isSelected ? "text-white" : "text-slate-900"
                  }`}
                >
                  {m.name}
                </p>
                <p
                  className={`text-[11px] mt-0.5 line-clamp-1 ${
                    isSelected ? "text-purple-200" : "text-slate-400"
                  }`}
                >
                  {m.architecture}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Evaluation Section for Selected Model */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
        {/* Model Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedModel.name}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="font-semibold text-purple-700">{selectedModel.framework}</span>
                  <span>•</span>
                  <span>{selectedModel.version}</span>
                  <span>•</span>
                  <span>Evaluated: {selectedModel.trainedAt}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 pt-1 leading-relaxed">{selectedModel.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center min-w-[90px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</p>
              <p className="text-base font-extrabold text-slate-900">{selectedModel.accuracy}</p>
            </div>
            <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-center min-w-[90px]">
              <p className="text-[10px] font-bold text-purple-600 uppercase">ROC-AUC</p>
              <p className="text-base font-extrabold text-purple-900">{selectedModel.rocAuc}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center min-w-[90px]">
              <p className="text-[10px] font-bold text-emerald-600 uppercase">F1 Score</p>
              <p className="text-base font-extrabold text-emerald-900">{selectedModel.f1Score}</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center min-w-[90px]">
              <p className="text-[10px] font-bold text-amber-600 uppercase">Latency</p>
              <p className="text-base font-extrabold text-amber-900">{selectedModel.inferenceTimeMs} ms</p>
            </div>
          </div>
        </div>

        {/* 2x2 Evaluation Visuals Grid: Confusion Matrix & ROC Curve */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 1. Confusion Matrix Visualization */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <GridIcon className="h-4 w-4 text-purple-600" />
                  Confusion Matrix (Test Evaluation Split)
                </h3>
                <p className="text-xs text-slate-500">
                  Classification distribution on test holdout dataset (10,000 samples).
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Total: 10,000</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* True Positive */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  True Positive (TP)
                </p>
                <p className="text-xl font-extrabold text-emerald-950 mt-1">
                  {selectedModel.confusionMatrix.tp.toLocaleString()}
                </p>
                <p className="text-[11px] font-medium text-emerald-600">
                  {((selectedModel.confusionMatrix.tp / 10000) * 100).toFixed(1)}% of samples
                </p>
              </div>

              {/* False Positive */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  False Positive (FP - Type I)
                </p>
                <p className="text-xl font-extrabold text-rose-950 mt-1">
                  {selectedModel.confusionMatrix.fp.toLocaleString()}
                </p>
                <p className="text-[11px] font-medium text-rose-600">
                  {((selectedModel.confusionMatrix.fp / 10000) * 100).toFixed(1)}% error rate
                </p>
              </div>

              {/* False Negative */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  False Negative (FN - Type II)
                </p>
                <p className="text-xl font-extrabold text-amber-950 mt-1">
                  {selectedModel.confusionMatrix.fn.toLocaleString()}
                </p>
                <p className="text-[11px] font-medium text-amber-600">
                  {((selectedModel.confusionMatrix.fn / 10000) * 100).toFixed(1)}% missed
                </p>
              </div>

              {/* True Negative */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  True Negative (TN)
                </p>
                <p className="text-xl font-extrabold text-blue-950 mt-1">
                  {selectedModel.confusionMatrix.tn.toLocaleString()}
                </p>
                <p className="text-[11px] font-medium text-blue-600">
                  {((selectedModel.confusionMatrix.tn / 10000) * 100).toFixed(1)}% of samples
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold pt-2 text-slate-600 border-t border-slate-200/60">
              <span>Precision: <strong>{(selectedModel.precision * 100).toFixed(1)}%</strong></span>
              <span>Recall: <strong>{(selectedModel.recall * 100).toFixed(1)}%</strong></span>
              <span>Log Loss: <strong>{selectedModel.logLoss}</strong></span>
            </div>
          </div>

          {/* 2. ROC-AUC Curve Chart */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  ROC-AUC Curve Evaluation
                </h3>
                <p className="text-xs text-slate-500">
                  True Positive Rate (Sensitivity) vs False Positive Rate (1 - Specificity).
                </p>
              </div>
              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                AUC = {selectedModel.rocAuc}
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedModel.rocCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="fpr" tick={{ fontSize: 10 }} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, "TPR"]}
                    labelFormatter={(val: any) => `FPR: ${(Number(val) * 100).toFixed(1)}%`}
                  />
                  <Area
                    type="monotone"
                    dataKey="tpr"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fill="#ddd6fe"
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Feature Importance & Training Epoch Loss Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Feature Importance Bar Chart */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-purple-600" />
                  Feature Importance Attribution (SHAP / Gini)
                </h3>
                <p className="text-xs text-slate-500">
                  Top customer features contributing to the model's decision boundary.
                </p>
              </div>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedModel.features} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 0.4]} />
                  <YAxis dataKey="feature" type="category" tick={{ fontSize: 10, fill: "#334155" }} width={120} />
                  <Tooltip formatter={(v: any) => [`${(Number(v) * 100).toFixed(1)}%`, "Importance"]} />
                  <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                    {selectedModel.features.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#7c3aed" : index === 1 ? "#8b5cf6" : "#a78bfa"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Loss Convergence Line Chart */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  Training & Validation Loss History
                </h3>
                <p className="text-xs text-slate-500">
                  Cross-entropy log loss over 100 training epochs (no overfitting detected).
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-600"></span> Train Loss
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Val Loss
                </span>
              </div>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedModel.lossHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="epoch" tick={{ fontSize: 10 }} label={{ value: 'Epochs', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis domain={[0, 0.8]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="trainLoss" stroke="#7c3aed" strokeWidth={2} dot={false} name="Train Loss" />
                  <Line type="monotone" dataKey="valLoss" stroke="#f59e0b" strokeWidth={2} dot={false} name="Val Loss" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Hyperparameters Config Table */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sliders className="h-4 w-4 text-purple-600" />
            Model Hyperparameters & Training Configuration
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            {Object.entries(selectedModel.hyperparameters).map(([key, val]) => (
              <div key={key} className="rounded-lg bg-white border border-slate-200 p-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">{key}</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5 font-mono">{String(val)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Real-Time Prediction Simulator */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold border border-purple-400/30">
            <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Interactive Model Inference Simulator (Live Demo)
            </h3>
            <p className="text-xs text-purple-200">
              Adjust customer behavior parameters below to run real-time inference against the trained model pipeline.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sliders Input Controls */}
          <div className="space-y-4 rounded-xl bg-white/10 p-5 backdrop-blur-md border border-white/10">
            {/* Slider 1: Product Views */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-purple-100">
                <span>Product Views Count:</span>
                <span className="font-bold text-white">{simViews} views</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={simViews}
                onChange={(e) => setSimViews(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* Slider 2: Cart Additions */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-purple-100">
                <span>Cart Additions:</span>
                <span className="font-bold text-white">{simCarts} items</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={simCarts}
                onChange={(e) => setSimCarts(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* Slider 3: Days Since Last Visit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-purple-100">
                <span>Days Since Last Visit:</span>
                <span className="font-bold text-white">{simDays} days</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={simDays}
                onChange={(e) => setSimDays(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* Slider 4: Session Duration */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-purple-100">
                <span>Session Duration (Minutes):</span>
                <span className="font-bold text-white">{simDuration} mins</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={simDuration}
                onChange={(e) => setSimDuration(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRunSim}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-extrabold text-slate-950 shadow-lg hover:bg-amber-300 active:scale-98 transition-all cursor-pointer mt-2"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              Run Real-Time Model Inference
            </button>
          </div>

          {/* Inference Output Result */}
          <div className="flex flex-col justify-between rounded-xl bg-white/10 p-5 backdrop-blur-md border border-white/10">
            <div>
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Model Prediction Result
              </p>
              {simResult ? (
                <div className="mt-4 space-y-4 animate-in fade-in duration-300">
                  <div>
                    <p className="text-xs text-purple-200 font-medium">Purchase Conversion Propensity:</p>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                        {simResult.propensity}%
                      </span>
                      <span className="text-xs font-semibold text-purple-200">
                        (Confidence Interval: ±1.2%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2.5 w-full rounded-full bg-slate-800/80 mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${simResult.propensity}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-black/30 p-3 border border-white/10 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-300 font-medium">Predicted Journey Stage:</span>
                      <span className="font-bold text-white">{simResult.stage}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-300 font-medium">Recommended Action:</span>
                      <span className="font-bold text-amber-300">{simResult.action}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-purple-200/60 space-y-2">
                  <Cpu className="h-8 w-8 mx-auto opacity-50" />
                  <p className="text-xs">Adjust the sliders and click "Run Real-Time Model Inference"</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-purple-300/80 pt-4 border-t border-white/10 mt-4">
              <span>Latency: <strong>12.4 ms</strong></span>
              <span>Model: <strong>XGBoost Propensity v2.4</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Inventory Summary Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-600" />
            All Trained Model Versions & Checkpoints
          </h3>
          <span className="text-xs text-slate-500">4 Active Models in Registry</span>
        </div>

        <DataTable<DetailedModel>
          data={MODELS_DATA}
          keyExtractor={(m) => m.id}
          columns={[
            {
              key: "name",
              header: "Model Name",
              render: (m) => (
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200/60">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{m.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{m.version}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "architecture",
              header: "Architecture & Framework",
              render: (m) => (
                <div>
                  <p className="text-xs font-semibold text-slate-800">{m.architecture}</p>
                  <p className="text-[11px] text-purple-600 font-medium">{m.framework}</p>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (m) => (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${
                    m.status === "CHAMPION"
                      ? "bg-purple-100 text-purple-800 border-purple-300"
                      : m.status === "CHALLENGER"
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-emerald-50 text-emerald-700 border-emerald-300"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  {m.status}
                </span>
              ),
            },
            {
              key: "rocAuc",
              header: "ROC-AUC",
              render: (m) => <span className="font-mono font-bold text-xs text-purple-700">{m.rocAuc}</span>,
            },
            {
              key: "accuracy",
              header: "Accuracy",
              render: (m) => <span className="font-mono font-semibold text-xs text-slate-800">{m.accuracy}</span>,
            },
            {
              key: "f1Score",
              header: "F1 Score",
              render: (m) => <span className="font-mono font-semibold text-xs text-emerald-700">{m.f1Score}</span>,
            },
            {
              key: "inferenceTimeMs",
              header: "Latency",
              render: (m) => <span className="font-mono text-xs text-slate-600">{m.inferenceTimeMs} ms</span>,
            },
          ]}
        />
      </div>
    </div>
  );
}

function GridIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
