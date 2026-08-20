import { Link } from "react-router-dom";
import { LandingNavbar, LandingFooter } from "@/components/layout/LandingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  Brain,
  GitBranch,
  Layers,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { APP_NAME } from "@/config";

const concepts = [
  {
    icon: Brain,
    title: "Prediction",
    question: "What is the customer likely to do?",
    description:
      "ML models forecast next events, purchase propensity, churn risk, and inactivity — grounded in observed behavioral data only.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Target,
    title: "Decision",
    question: "What should the marketer do?",
    description:
      "The decision engine combines predictions, journey stage, segment, and behavioral features to recommend the next best marketing action.",
    color: "text-violet-600 bg-violet-50",
  },
  {
    icon: TrendingUp,
    title: "Outcome",
    question: "What actually happened?",
    description:
      "Track campaign results, experiment performance, and strategy evaluation to close the loop and improve future recommendations.",
    color: "text-emerald-600 bg-emerald-50",
  },
];

const capabilities = [
  { icon: Route, title: "Journey Construction", desc: "Build chronological customer journeys from behavioral events across sessions." },
  { icon: Layers, title: "Stage Identification", desc: "Map customers to journey stages — awareness through retention and churn risk." },
  { icon: Users, title: "Segmentation", desc: "RFM, behavioral, and ML-driven clusters for targeted marketing." },
  { icon: Sparkles, title: "Predictive Intelligence", desc: "Purchase propensity, next-event prediction, and risk scoring." },
  { icon: Zap, title: "Next Best Actions", desc: "Cart reminders, product recommendations, re-engagement, and more." },
  { icon: BarChart3, title: "Explainable Analytics", desc: "Funnels, conversion trends, and executive dashboards with clear insights." },
];

const steps = [
  { step: "01", title: "Ingest Events", desc: "Import behavioral data from CSV, JSON, APIs, or web tracking — no vendor lock-in." },
  { step: "02", title: "Build Journeys", desc: "Construct session-aware customer journeys with standardized event types." },
  { step: "03", title: "Enrich & Segment", desc: "Compute features, assign journey stages, and cluster customers." },
  { step: "04", title: "Predict & Act", desc: "Run ML predictions and trigger the right marketing action at the right time." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium">
              AI-Powered Marketing Intelligence Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Understand every customer journey.{" "}
              <span className="text-gradient">Predict what happens next.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {APP_NAME} analyzes behavioral events, constructs chronological journeys,
              segments customers, predicts future behavior, and recommends the next best
              marketing action — with explainable analytics marketers can trust.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20" asChild>
                <Link to="/login">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <a href="#concepts">Explore concepts</a>
              </Button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "11+", label: "Event types" },
              { value: "360°", label: "Customer view" },
              { value: "ML", label: "Ready architecture" },
              { value: "SaaS", label: "Multi-tenant design" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform overview */}
      <section id="platform" className="border-t bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">One platform for the full customer lifecycle</h2>
            <p className="mt-4 text-muted-foreground">
              From raw behavioral events to actionable marketing decisions — designed for
              marketing teams who need clarity, not complexity.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {capabilities.map((cap) => (
              <Card key={cap.title} className="border-0 shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <cap.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cap.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core concepts */}
      <section id="concepts" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Three concepts, one intelligent loop</h2>
            <p className="mt-4 text-muted-foreground">
              The platform deliberately separates prediction, decision, and outcome —
              so marketers always know what the AI thinks vs. what they should do.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {concepts.map((concept, i) => (
              <div key={concept.title} className="relative">
                {i < concepts.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-px w-8 translate-x-full bg-border lg:block" />
                )}
                <Card className="h-full border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="pt-8">
                    <div className={`mb-4 inline-flex rounded-lg p-3 ${concept.color}`}>
                      <concept.icon className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {concept.title}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold italic">&ldquo;{concept.question}&rdquo;</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{concept.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Flow diagram */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            {["Customer State", "Prediction Engine", "Decision Engine", "Next Best Action", "Outcome", "Learning"].map(
              (step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-full border bg-card px-3 py-1.5 shadow-sm">{step}</span>
                  {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-primary" />}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-4 text-slate-400">
              A clear pipeline from data ingestion to marketing activation — built to scale from capstone to SaaS.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <div key={item.step} className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <span className="text-4xl font-bold text-primary/40">{item.step}</span>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities detail */}
      <section id="capabilities" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4">Next Best Marketing Actions</Badge>
              <h2 className="text-3xl font-bold tracking-tight">Turn insights into action</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Supported actions include cart reminders, product recommendations, personalized emails,
                retargeting, discounts, cross-sell, re-engagement, and intelligent suppression —
                each chosen by the decision engine, not hardcoded rules.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Events only treated as observed when your data source contains them",
                  "No hardcoded dataset vendors — adapter architecture for any source",
                  "Role-based access for admins, analysts, and marketing managers",
                  "Multi-tenant foundation ready for enterprise SaaS",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="mt-8" asChild>
                <Link to="/login">Sign in to explore <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-8">
              <div className="space-y-4 font-mono text-sm">
                <div className="rounded-lg bg-card p-4 shadow-sm border-l-4 border-l-blue-500">
                  <p className="text-xs text-muted-foreground">PREDICTION</p>
                  <p className="mt-1 font-semibold text-foreground">Next Event: PURCHASE (78% confidence)</p>
                </div>
                <div className="flex justify-center"><ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" /></div>
                <div className="rounded-lg bg-card p-4 shadow-sm border-l-4 border-l-violet-500">
                  <p className="text-xs text-muted-foreground">DECISION</p>
                  <p className="mt-1 font-semibold text-foreground">Action: CART_REMINDER</p>
                  <p className="mt-1 text-xs text-muted-foreground">Reason: Recent cart addition, high engagement, no purchase</p>
                </div>
                <div className="flex justify-center"><ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" /></div>
                <div className="rounded-lg bg-card p-4 shadow-sm border-l-4 border-l-emerald-500">
                  <p className="text-xs text-muted-foreground">OUTCOME</p>
                  <p className="mt-1 font-semibold text-foreground">Conversion tracked → model feedback loop</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            Ready to explore customer journey intelligence?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Sign in with demo credentials or create a new organization to start analyzing journeys.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="h-12 px-8" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-primary-foreground/30 bg-transparent px-8 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/register">Create account</Link>
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
