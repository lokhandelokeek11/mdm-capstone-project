import type { AnalyticsMetric } from "@/types";

export const dashboardMetrics: AnalyticsMetric[] = [
  { label: "Total Customers", value: 1407580, change: 8.4, format: "number" },
  { label: "Active Customers", value: 385420, change: 5.2, format: "number" },
  { label: "Total Sessions", value: 2756101, change: 12.1, format: "number" },
  { label: "Conversion Rate", value: 0.83, change: 0.12, format: "percent" },
  { label: "Cart Abandonment Rate", value: 67.6, change: -1.8, format: "percent" },
  { label: "High Intent Customers", value: 27146, change: 14.5, format: "number" },
  { label: "Repeat Buyers", value: 2576, change: 6.3, format: "number" },
  { label: "Inactive Customers", value: 1022160, change: -3.1, format: "number" },
];

export const funnelData = [
  { stage: "Awareness (Views)", count: 2664312, fill: "hsl(271 91% 65%)" },
  { stage: "Consideration", count: 385420, fill: "hsl(271 75% 55%)" },
  { stage: "Intent (Carts)", count: 69332, fill: "hsl(271 60% 45%)" },
  { stage: "Purchase (Orders)", count: 22457, fill: "hsl(142 76% 36%)" },
  { stage: "Retention (Repeat)", count: 2576, fill: "hsl(142 60% 45%)" },
];

export const journeyStageDistribution = [
  { name: "Awareness", value: 45 },
  { name: "Consideration", value: 28 },
  { name: "High Intent", value: 15 },
  { name: "Purchase", value: 8 },
  { name: "Retention", value: 4 },
];

export const segmentDistribution = [
  { name: "Cart Abandoners", value: 28 },
  { name: "High Intent", value: 22 },
  { name: "Repeat Buyers", value: 18 },
  { name: "Browsers", value: 20 },
  { name: "Inactive", value: 12 },
];

export const conversionTrend = [
  { date: "Jan", rate: 2.8 },
  { date: "Feb", rate: 3.1 },
  { date: "Mar", rate: 3.4 },
  { date: "Apr", rate: 3.2 },
  { date: "May", rate: 3.6 },
  { date: "Jun", rate: 3.8 },
];

export const commonJourneyPaths = [
  { path: "View → View → Search → Cart → Purchase", count: 342, conversion: 24.5 },
  { path: "View → Cart → Abandon", count: 1289, conversion: 0 },
  { path: "Search → View → View → Cart", count: 567, conversion: 12.3 },
  { path: "View → View → View → Exit", count: 2341, conversion: 0 },
  { path: "Ad Click → View → Cart → Purchase", count: 198, conversion: 31.2 },
];

export const topOpportunities = [
  {
    id: "1",
    customerId: "82931",
    segment: "Cart Abandoner",
    action: "CART_REMINDER",
    propensity: 78,
    impact: "High",
  },
  {
    id: "2",
    customerId: "82945",
    segment: "High Intent",
    action: "PRODUCT_RECOMMENDATION",
    propensity: 85,
    impact: "High",
  },
  {
    id: "3",
    customerId: "82952",
    segment: "Inactive",
    action: "RE_ENGAGEMENT",
    propensity: 32,
    impact: "Medium",
  },
];

export const recentJourneys = [
  {
    customerId: "82931",
    stage: "HIGH INTENT",
    events: 12,
    lastEvent: "ADD_TO_CART",
    time: "2 hours ago",
  },
  {
    customerId: "82945",
    stage: "CONSIDERATION",
    events: 8,
    lastEvent: "PRODUCT_VIEW",
    time: "4 hours ago",
  },
  {
    customerId: "82952",
    stage: "INACTIVE",
    events: 3,
    lastEvent: "SESSION_END",
    time: "2 days ago",
  },
];
