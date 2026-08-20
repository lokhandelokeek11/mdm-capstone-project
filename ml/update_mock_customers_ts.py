import json
import os

def main():
    json_path = os.path.join("data", "artifacts", "50_customers.json")
    ts_path = os.path.join("frontend", "src", "features", "customers", "data", "mockCustomers.ts")
    
    with open(json_path, "r") as f:
        customers = json.load(f)
        
    ts_content = """import type { Customer, CustomerDetail } from "@/types";

export const mockCustomers: Customer[] = """ + json.dumps(customers, indent=2) + """;

export const mockCustomerDetail: CustomerDetail = {
  ...mockCustomers[0],
  sessions: 5,
  views: 24,
  cartAdditions: 3,
  purchases: 0,
  uniqueProducts: 8,
  predictedNextEvent: "PURCHASE",
  recommendedAction: "CART_REMINDER",
  recommendationReasons: [
    "Recent cart addition (item #460429)",
    "Repeated product views in Category #1338",
    "High session engagement velocity",
    "No transaction recorded in last 24h",
  ],
  journeyEvents: [
    { id: "e1", eventType: "PRODUCT_VIEW", label: "Product View", occurredAt: "2026-08-20T08:00:00Z", productName: "Item #460429 (Category #1338)" },
    { id: "e2", eventType: "PRODUCT_VIEW", label: "Product View", occurredAt: "2026-08-20T08:15:00Z", productName: "Item #206783 (Category #888)" },
    { id: "e3", eventType: "SEARCH", label: "Search", occurredAt: "2026-08-20T08:30:00Z" },
    { id: "e4", eventType: "ADD_TO_CART", label: "Add to Cart", occurredAt: "2026-08-20T09:00:00Z", productName: "Item #460429 (Category #1338)" },
    { id: "e5", eventType: "PRODUCT_VIEW", label: "Product View", occurredAt: "2026-08-20T10:00:00Z", productName: "Item #460429 (Category #1338)" },
    { id: "e6", eventType: "SESSION_END", label: "Return", occurredAt: "2026-08-20T10:30:00Z" },
  ],
  insights: [
    "High engagement in the last 24 hours",
    "Viewed item #460429 in Category #1338 3 times",
    "Cart value above average for segment",
    "Inventory stock verified: available: 1",
  ],
};

export function getMockCustomerById(id: string): CustomerDetail | undefined {
  const customer = mockCustomers.find((c) => c.id === id || c.externalId === id);
  if (!customer) return undefined;
  if (customer.externalId === customers[0].externalId) return mockCustomerDetail;
  return {
    ...customer,
    sessions: 3,
    views: 12,
    cartAdditions: 1,
    purchases: customer.purchaseStatus === "PURCHASED" ? 2 : 0,
    uniqueProducts: 5,
    predictedNextEvent: "PRODUCT_VIEW",
    recommendedAction: "PRODUCT_RECOMMENDATION",
    recommendationReasons: ["Based on browsing behavior"],
    journeyEvents: [],
    insights: ["RetailRocket event log snapshot"],
  };
}
"""
    with open(ts_path, "w") as f:
        f.write(ts_content)
        
    print(f"Updated {ts_path} with {len(customers)} real customer records!")

if __name__ == "__main__":
    main()
