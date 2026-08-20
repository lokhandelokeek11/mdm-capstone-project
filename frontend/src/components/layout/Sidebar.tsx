import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Route,
  PieChart,
  Brain,
  Zap,
  ShoppingBag,
  BarChart3,
  FlaskConical,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth/AuthProvider";

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: { label: string; href: string }[];
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    groupName: "NAVIGATION",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      {
        label: "Customers",
        icon: Users,
        children: [
          { label: "All Customers", href: "/customers" },
          { label: "High Intent", href: "/customers?filter=high-intent" },
          { label: "Cart Abandoners", href: "/customers?filter=cart-abandoners" },
          { label: "Buyers", href: "/customers?filter=buyers" },
          { label: "Inactive", href: "/customers?filter=inactive" },
        ],
      },
      {
        label: "Journeys",
        icon: Route,
        children: [
          { label: "Journey Explorer", href: "/journeys" },
          { label: "Journey Stages", href: "/journeys/stages" },
          { label: "Common Paths", href: "/journeys/paths" },
          { label: "Drop-Off Analysis", href: "/journeys/dropoffs" },
        ],
      },
      {
        label: "Segments",
        icon: PieChart,
        children: [
          { label: "All Segments", href: "/segments" },
          { label: "RFM / Behavioral", href: "/segments/rfm" },
          { label: "ML Clusters", href: "/segments/clusters" },
        ],
      },
    ],
  },
  {
    groupName: "INTELLIGENCE",
    items: [
      {
        label: "Intelligence",
        icon: Brain,
        children: [
          { label: "Predictions", href: "/intelligence/predictions" },
          { label: "Purchase Propensity", href: "/intelligence/propensity" },
          { label: "Risk Analysis", href: "/intelligence/risk" },
          { label: "Model Explanation", href: "/intelligence/explanations" },
        ],
      },
      {
        label: "Next Best Actions",
        icon: Zap,
        badge: "99+",
        children: [
          { label: "Recommendations", href: "/next-best-actions" },
          { label: "Action Rules", href: "/next-best-actions/rules" },
          { label: "Suppression / Wait", href: "/next-best-actions/suppression" },
        ],
      },
      {
        label: "Recommendations",
        icon: ShoppingBag,
        children: [
          { label: "Products", href: "/recommendations/products" },
          { label: "Personalization", href: "/recommendations/personalization" },
        ],
      },
    ],
  },
  {
    groupName: "ANALYTICS & TESTING",
    items: [
      {
        label: "Analytics",
        icon: BarChart3,
        children: [
          { label: "Executive Dashboard", href: "/analytics" },
          { label: "Funnel", href: "/analytics/funnel" },
          { label: "Segment Analytics", href: "/analytics/segments" },
          { label: "Product Analytics", href: "/analytics/products" },
        ],
      },
      {
        label: "Experiments",
        icon: FlaskConical,
        children: [
          { label: "Strategy Comparison", href: "/experiments/strategies" },
          { label: "Model Evaluation", href: "/experiments/models" },
        ],
      },
    ],
  },
  {
    groupName: "ADMINISTRATION",
    items: [
      {
        label: "Admin",
        icon: Settings,
        children: [
          { label: "Interactive System Demo", href: "/admin/demo" },
          { label: "Datasets", href: "/admin/datasets" },
          { label: "Models", href: "/admin/models" },
          { label: "Users", href: "/admin/users" },
          { label: "Configuration", href: "/admin/configuration" },
        ],
      },
    ],
  },
];

function NavSectionItem({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive = item.href
    ? location.pathname === item.href
    : item.children?.some((c) => location.pathname.startsWith(c.href.split("?")[0]));
  const [open, setOpen] = useState(isActive ?? false);
  const Icon = item.icon;

  if (item.href && !item.children) {
    return (
      <Link
        to={item.href}
        className={cn(
          "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 outline-none focus:outline-none focus-visible:outline-none",
          isActive
            ? "bg-gradient-to-r from-purple-900/60 via-purple-950/80 to-purple-900/60 text-white shadow-sm border border-purple-500/30 font-semibold"
            : "text-slate-400 hover:bg-[#181126] hover:text-slate-100",
        )}
      >
        <span className="flex items-center gap-3">
          {Icon && <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-purple-400" : "text-slate-400 group-hover:text-slate-200")} />}
          {item.label}
        </span>
        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 outline-none focus:outline-none focus-visible:outline-none",
          isActive
            ? "bg-gradient-to-r from-purple-900/60 via-purple-950/80 to-purple-900/60 text-white shadow-sm border border-purple-500/30 font-semibold"
            : "text-slate-400 hover:bg-[#181126] hover:text-slate-100",
        )}
      >
        <span className="flex items-center gap-3">
          {Icon && <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-purple-400" : "text-slate-400 group-hover:text-slate-200")} />}
          {item.label}
        </span>
        <div className="flex items-center gap-2">
          {item.badge && (
            <span className="rounded-full bg-pink-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {item.badge}
            </span>
          )}
          {open ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
        </div>
      </button>
      {open && item.children && (
        <div className="ml-3 mt-1.5 space-y-1 border-l border-purple-500/10 pl-3">
          {item.children.map((child) => {
            const isChildActive = location.pathname === child.href.split("?")[0];
            return (
              <Link
                key={child.href}
                to={child.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors outline-none focus:outline-none",
                  isChildActive
                    ? "text-purple-300 font-semibold bg-purple-950/60 border-l-2 border-purple-400 pl-2"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#181126]/80",
                )}
              >
                <span>{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const displayName = (!user?.name || user.name.includes("Demo") || user.name.includes("Ashish")) ? "Lokeek Lokhande" : user.name;

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0C0814] text-slate-100 shadow-2xl transition-transform lg:static lg:translate-x-0 border-r border-purple-950/30",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-purple-950/40 px-4">
          <Link to="/dashboard" className="flex items-center gap-3 group py-1">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-white p-1 shadow-md border border-purple-400/30 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="JourneyIQ Logo" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-black tracking-tight text-white leading-tight">
                JourneyIQ
              </p>
              <p className="text-[10px] text-purple-300 font-bold tracking-widest uppercase mt-0.5">Intelligence</p>
            </div>
          </Link>
          <button type="button" className="lg:hidden text-slate-400 hover:text-white" onClick={onClose} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {navigationGroups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {group.groupName}
              </p>
              {group.items.map((item) => (
                <NavSectionItem key={item.label} item={item} />
              ))}
            </div>
          ))}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="border-t border-purple-950/40 p-4 bg-[#090610]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                {displayName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-semibold text-white">{displayName}</p>
                <p className="truncate text-[10px] text-purple-300/80 font-medium">{user?.role ?? "Admin"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              title="Sign out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-950/60 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { logout } = useAuth();
  const location = useLocation();

  // Compute breadcrumb path dynamically
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumb = pathParts.length > 0
    ? pathParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" > ")
    : "Dashboard";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 lg:px-8 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button type="button" className="lg:hidden p-1.5 rounded-lg border text-slate-600" onClick={onMenuClick} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs matching image inspiration */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="text-slate-400">Admin</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">{breadcrumb}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell matching Image 2 */}
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white ring-2 ring-white">
            99+
          </span>
        </button>

        {/* User Info / Logout Button matching Image 2 */}
        <div className="h-4 w-px bg-slate-200" />

        <button
          type="button"
          onClick={() => void logout()}
          className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-2xs"
        >
          <LogOut className="h-3.5 w-3.5 text-slate-500" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

