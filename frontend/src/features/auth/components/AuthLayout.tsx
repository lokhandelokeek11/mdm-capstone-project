import { Link } from "react-router-dom";
import { APP_NAME } from "@/config";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const features = [
  "Real-time customer journey mapping & event sequences",
  "ML-powered purchase propensity & churn risk scoring",
  "Next best marketing action (NBMA) decision engine",
  "Explainable analytics & behavioral customer segment insights",
  "Multi-tenant SaaS-ready architecture with tenant isolation",
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left panel — branding matching main theme */}
      <div className="relative hidden w-[45%] overflow-hidden bg-[#0C0814] text-white lg:flex lg:flex-col lg:justify-between border-r border-purple-950/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full hero-glow-circle blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-10 h-64 w-64 rounded-full hero-glow-circle blur-2xl pointer-events-none" />

        <div className="relative z-10 p-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-white p-1.5 shadow-lg border border-purple-400/30 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="JourneyIQ Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-base font-black text-white tracking-tight leading-tight">
                JourneyIQ
              </p>
              <p className="text-xs text-purple-300 font-semibold tracking-wide">Customer Journey Intelligence</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 xl:px-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-950/80 border border-purple-800/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-300 w-fit mb-4">
            AI-POWERED MARKETING PLATFORM
          </span>
          
          <h2 className="text-3xl font-extrabold leading-tight text-white xl:text-4xl">
            Turn behavioral data into{" "}
            <span className="text-gradient">predictive marketing decisions</span>
          </h2>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-400 font-medium">
            Analyze customer journeys, predict behavior, and trigger Next Best Actions from a single platform.
          </p>

          <ul className="mt-8 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-purple-950/40 p-10 bg-[#090610]">
          <blockquote className="text-xs italic text-slate-400">
            &ldquo;Separating what customers will do from what marketers should do is the core key to conversion growth.&rdquo;
          </blockquote>
          <p className="mt-2 text-[11px] font-semibold text-purple-400">— CJI Core Platform Principle</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-bold text-slate-900">{APP_NAME}</span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors">
            ← Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md animate-fade-in-up">
            <div className="mb-6">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
              <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

