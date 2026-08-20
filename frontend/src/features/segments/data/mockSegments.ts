import type { Segment } from "@/types";

export const mockSegments: Segment[] = [
  { id: "s1", name: "Cart Abandoners", description: "Added to cart but did not purchase", customerCount: 2847, isActive: true },
  { id: "s2", name: "High Intent", description: "Strong purchase signals in recent sessions", customerCount: 892, isActive: true },
  { id: "s3", name: "Repeat Buyers", description: "Multiple purchases in last 90 days", customerCount: 1243, isActive: true },
  { id: "s4", name: "Browsers", description: "Product views without cart additions", customerCount: 4521, isActive: true },
  { id: "s5", name: "Inactive", description: "No activity in last 30 days", customerCount: 3214, isActive: true },
  { id: "s6", name: "RFM Champions", description: "High recency, frequency, and monetary value", customerCount: 456, isActive: true },
];
