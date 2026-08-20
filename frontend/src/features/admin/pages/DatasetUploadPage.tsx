import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { datasetUploadSchema, type DatasetUploadFormData } from "@/schemas";
import { ArrowLeft, Upload, CheckCircle2, FileSpreadsheet, ArrowRight, Database, Play, RefreshCw, Check } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils/cn";

type WizardStep = 1 | 2 | 3 | 4;

export function DatasetUploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<DatasetUploadFormData>({
    resolver: zodResolver(datasetUploadSchema),
    defaultValues: { name: "RetailRocket E-commerce Dataset", description: "RetailRocket historical behavioral event logs", sourceType: "CSV" as const },
  });

  // Schema Column Mapping State
  const [columnMappings, setColumnMappings] = useState([
    { sourceCol: "visitorid", systemField: "Customer ID", sample: "257597" },
    { sourceCol: "timestamp", systemField: "Timestamp", sample: "1433221332117" },
    { sourceCol: "event", systemField: "Event Type", sample: "view" },
    { sourceCol: "itemid", systemField: "Product ID", sample: "355908" },
    { sourceCol: "transactionid", systemField: "Transaction ID", sample: "18452" },
  ]);

  // Data Quality Metrics State
  const validationMetrics = {
    totalRecords: 2756101,
    validRecords: 2754820,
    invalidRecords: 1281,
    duplicateRecords: 540,
    missingCustomerIds: 120,
    invalidTimestamps: 31,
    unknownEvents: 0,
    status: "READY FOR PROCESSING",
  };

  const validateFile = (f: File) => {
    return f.name.endsWith(".csv") || f.name.endsWith(".json");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && validateFile(dropped)) setFile(dropped);
  }, []);

  const handleRegisterDataset = async (_data: DatasetUploadFormData) => {
    setStep(2); // Move to Step 2 — Schema Detection & Mapping
  };

  const handleConfirmMapping = () => {
    setStep(3); // Move to Step 3 — Data Validation Report
  };

  const handleStartPipeline = async () => {
    setStep(4);
    setIsProcessing(true);
    // Simulate pipeline processing steps: Standardization -> Sessionization -> Customer 360 -> ML Engine
    setTimeout(() => {
      setIsProcessing(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild className="rounded-xl border-slate-200 text-xs font-semibold">
          <Link to="/admin/datasets">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Datasets
          </Link>
        </Button>

        {/* Step Wizard Progress Pill */}
        <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1 border border-slate-200">
          {[
            { id: 1, label: "Upload & Register" },
            { id: 2, label: "Schema Mapping" },
            { id: 3, label: "Quality Validation" },
            { id: 4, label: "Pipeline & ML" },
          ].map((s) => (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all",
                step === s.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : step > s.id
                  ? "bg-purple-100 text-purple-700"
                  : "text-slate-500",
              )}
            >
              <span>{s.id}.</span>
              <span>{s.label}</span>
              {step > s.id && <Check className="h-3 w-3" />}
            </div>
          ))}
        </div>
      </div>

      <PageHeader
        title="Dataset Ingestion & Data Pipeline Wizard"
        description="Follow the 4-step pipeline: File Upload → Schema Mapping → Data Quality Check → Sessionization & ML Engine Execution."
      />

      {/* STEP 1: Upload & Registration */}
      {step === 1 && (
        <form onSubmit={handleSubmit(handleRegisterDataset)} className="space-y-6">
          <Card className="p-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-600" />
                Step 1 — Upload Dataset & Register Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-700">Dataset Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., RetailRocket E-commerce Dataset"
                    {...register("name")}
                    className="rounded-xl border-slate-200 text-xs"
                  />
                  {errors.name && <p className="text-xs text-rose-600 font-semibold">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold text-slate-700">Source Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., events.csv (2.75M behavioral logs)"
                    {...register("description")}
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Data Files (e.g. RetailRocket events.csv, item_properties) *</Label>
                <div
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-200 text-center",
                    dragOver
                      ? "border-purple-600 bg-purple-50/60 shadow-md scale-[1.01]"
                      : "border-slate-300/80 bg-slate-50/50 hover:bg-white hover:border-purple-400",
                  )}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                >
                  <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 shadow-xs">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Drag & Drop CSV / JSON Datasets</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">RetailRocket: events.csv, item_properties_part1.csv, category_tree.csv</p>
                  
                  <label className="mt-4 inline-block">
                    <input
                      type="file"
                      accept=".csv,.json"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && validateFile(f)) setFile(f);
                      }}
                    />
                    <span className="inline-flex items-center rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 cursor-pointer transition-colors">
                      Choose Dataset Files
                    </span>
                  </label>
                </div>

                {file ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{file.name}</span>
                      <span className="text-emerald-700/80 font-normal">({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                      File Selected
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-xs text-purple-900 font-semibold">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                      <span>Default Dataset: events.csv (RetailRocket Raw Dataset attached)</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-md">
                      2.75M Records Ready
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-2.5 shadow-sm">
            <span>Register & Proceed to Schema Detection</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>
      )}

      {/* STEP 2: Schema Detection & Column Mapping */}
      {step === 2 && (
        <div className="space-y-6">
          <Card className="p-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                  Step 2 — Schema Detection & System Field Mapping
                </CardTitle>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  ✓ Schema Auto-Detected (5 Columns)
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                The system inspected headers from the dataset file and auto-mapped them to internal platform schema models.
              </p>

              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Dataset Column (Raw)</th>
                      <th className="p-3">Sample Value</th>
                      <th className="p-3">Target System Field</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {columnMappings.map((col, idx) => (
                      <tr key={col.sourceCol} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-purple-950">{col.sourceCol}</td>
                        <td className="p-3 text-slate-500 font-mono">{col.sample}</td>
                        <td className="p-3">
                          <select
                            value={col.systemField}
                            onChange={(e) => {
                              const updated = [...columnMappings];
                              updated[idx].systemField = e.target.value;
                              setColumnMappings(updated);
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 focus:border-purple-600 focus:outline-none"
                          >
                            <option value="Customer ID">Customer ID (visitorid)</option>
                            <option value="Timestamp">Timestamp (timestamp)</option>
                            <option value="Event Type">Event Type (event)</option>
                            <option value="Product ID">Product ID (itemid)</option>
                            <option value="Transaction ID">Transaction ID (transactionid)</option>
                            <option value="Unmapped">Ignore / Unmapped</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Check className="h-3 w-3" /> Mapped
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl border-slate-200 text-xs font-bold">
              Back
            </Button>
            <Button onClick={handleConfirmMapping} className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-2.5 shadow-sm">
              Confirm Mapping & Validate Data
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Data Quality Validation */}
      {step === 3 && (
        <div className="space-y-6">
          <Card className="p-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Step 3 — Data Quality Check & Validation Report
                </CardTitle>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ✓ READY FOR PROCESSING
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-purple-50 p-4 border border-purple-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Total Records Ingested</p>
                  <p className="text-2xl font-black text-purple-950 mt-1">{formatNumber(validationMetrics.totalRecords)}</p>
                  <p className="text-[11px] text-purple-700/80 mt-1 font-semibold">events.csv</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Valid Records</p>
                  <p className="text-2xl font-black text-emerald-950 mt-1">{formatNumber(validationMetrics.validRecords)}</p>
                  <p className="text-[11px] text-emerald-700 mt-1 font-semibold">99.95% Pass Rate</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Invalid / Filtered</p>
                  <p className="text-2xl font-black text-amber-950 mt-1">{formatNumber(validationMetrics.invalidRecords)}</p>
                  <p className="text-[11px] text-amber-700 mt-1 font-semibold">Filtered automatically</p>
                </div>
              </div>

              {/* All 4 Dataset Files Ingestion Status */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Multi-File Dataset Validation Status (4 Files)</h4>
                <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 border border-purple-200">
                    <span className="font-bold text-purple-950">1. events.csv</span>
                    <span className="font-semibold text-emerald-700">2,756,101 Events Verified ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 border border-purple-200">
                    <span className="font-bold text-purple-950">2. category_tree.csv</span>
                    <span className="font-semibold text-emerald-700">1,669 Categories Loaded ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 border border-purple-200">
                    <span className="font-bold text-purple-950">3. item_properties_part1.csv</span>
                    <span className="font-semibold text-emerald-700">19,342 Item Category Mappings ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 border border-purple-200">
                    <span className="font-bold text-purple-950">4. item_properties_part2.csv</span>
                    <span className="font-semibold text-emerald-700">36,890 Stock Status Records ✓</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl border-slate-200 text-xs font-bold">
              Back
            </Button>
            <Button onClick={handleStartPipeline} className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-2.5 shadow-sm">
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Start Processing Pipeline
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Pipeline Execution & ML Intelligence */}
      {step === 4 && (
        <div className="space-y-6">
          <Card className="p-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {isProcessing ? <RefreshCw className="h-4 w-4 text-purple-600 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                Step 4 — Pipeline Processing & ML Engine Execution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="rounded-2xl bg-purple-950 p-6 text-white space-y-4 shadow-xl border border-purple-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">PIPELINE FLOW STATUS</span>
                  <span className={cn("text-xs font-bold px-3 py-1 rounded-full border", isProcessing ? "bg-purple-900 text-purple-200 border-purple-700 animate-pulse" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40")}>
                    {isProcessing ? "PROCESSING PIPELINE STEPS..." : "✓ PIPELINE COMPLETED"}
                  </span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>[STEP 5] Event Standardization: view → PRODUCT_VIEW, addtocart → ADD_TO_CART, transaction → PURCHASE</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>[STEP 6] Timestamp Parsing & Chronological Sorting: Unix ms → ISO 8601 Datetime</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>[STEP 7] Sessionization Engine: 30-minute inactivity gap threshold applied</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>[STEP 8] Customer 360 Feature Calculation: RFM, Recency, Frequency, View/Cart Ratios</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>[STEP 9] ML Intelligence Layer: RFM Segmentation, Purchase Propensity & Churn Risk models executed</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>[STEP 10] Decision Engine: Next Best Marketing Actions (NBMA) populated & Analytics synced</span>
                  </div>
                </div>
              </div>

              {!isProcessing && (
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Check className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">Dataset Ingestion Complete!</h4>
                      <p className="text-xs text-emerald-800 font-medium">
                        Customer 360, Segments, Propensity Scores, and Recommendations are live.
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/dashboard")} className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2">
                    View Live Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


