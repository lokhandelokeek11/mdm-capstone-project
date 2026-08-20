import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Activity, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "Concepts", href: "#concepts" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Capabilities", href: "#capabilities" },
];

export function LandingNavbar() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white p-1 shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="JourneyIQ Logo" className="h-full w-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-extrabold leading-none tracking-tight text-slate-900">JourneyIQ</p>
            <p className="text-[10px] font-semibold text-purple-600">Customer Journey Intelligence</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                <Link to="/register">Create account</Link>
              </Button>
              <Button asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </>
          )}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {!isAuthenticated && (
              <Link to="/register" className="text-sm font-medium text-primary" onClick={() => setMobileOpen(false)}>
                Create account
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">{APP_NAME}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            B.Tech Capstone Project — AI-driven customer journey intelligence for personalized digital marketing.
          </p>
        </div>
      </div>
    </footer>
  );
}
