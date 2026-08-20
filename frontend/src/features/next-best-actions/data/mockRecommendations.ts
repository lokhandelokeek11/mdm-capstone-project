import type { Recommendation } from "@/types";

export const mockRecommendations: Recommendation[] = [
  { id: "r1", customerId: "82931", customerName: "Customer 82931", actionType: "CART_REMINDER", reason: "Recent cart addition with no purchase", priority: 10, createdAt: "2026-08-20T10:30:00Z" },
  { id: "r2", customerId: "82934", customerName: "Customer 82934", actionType: "PRODUCT_RECOMMENDATION", reason: "High intent browsing pattern", priority: 9, createdAt: "2026-08-20T08:45:00Z" },
  { id: "r3", customerId: "82935", customerName: "Customer 82935", actionType: "RE_ENGAGEMENT", reason: "Inactive for 30+ days", priority: 7, createdAt: "2026-08-18T12:00:00Z" },
  { id: "r4", customerId: "82938", customerName: "Customer 82938", actionType: "CART_REMINDER", reason: "Cart abandoned 2 hours ago", priority: 8, createdAt: "2026-08-20T07:20:00Z" },
  { id: "r5", customerId: "82933", customerName: "Customer 82933", actionType: "PERSONALIZED_EMAIL", reason: "Browsing similar products", priority: 6, createdAt: "2026-08-18T09:15:00Z" },
];
