import type { Journey } from "@/types";

export const mockJourneys: Journey[] = [
  {
    customerId: "c845",
    externalId: "845",
    sessionCount: 3,
    eventCount: 3,
    firstInteraction: "2026-08-15T10:00:00Z",
    lastInteraction: "2026-08-20T10:30:00Z",
    journeyDuration: "5 days",
    events: [
      { id: "e1", eventType: "PRODUCT_VIEW", label: "Product View", occurredAt: "2026-08-20T08:00:00Z", productName: "Item #460429 (Category #1338)" },
      { id: "e2", eventType: "PRODUCT_VIEW", label: "Product View", occurredAt: "2026-08-20T08:15:00Z", productName: "Item #206783 (Category #888)" },
      { id: "e4", eventType: "ADD_TO_CART", label: "Add to Cart", occurredAt: "2026-08-20T09:00:00Z", productName: "Item #460429 (Category #1338)" },
    ],
  },
  {
    customerId: "c12148",
    externalId: "12148",
    sessionCount: 7,
    eventCount: 7,
    firstInteraction: "2026-07-01T09:00:00Z",
    lastInteraction: "2026-08-19T15:20:00Z",
    journeyDuration: "49 days",
    events: [
      { id: "e6", eventType: "PRODUCT_VIEW", label: "Product View", occurredAt: "2026-08-19T14:00:00Z", productName: "Item #395014 (Category #400)" },
      { id: "e7", eventType: "ADD_TO_CART", label: "Add to Cart", occurredAt: "2026-08-19T14:30:00Z", productName: "Item #395014 (Category #400)" },
      { id: "e8", eventType: "PURCHASE", label: "Purchase", occurredAt: "2026-08-19T15:20:00Z", productName: "Item #395014 (Category #400)" },
    ],
  },
  {
    customerId: "c1654",
    externalId: "1654",
    sessionCount: 4,
    eventCount: 4,
    firstInteraction: "2026-08-17T11:00:00Z",
    lastInteraction: "2026-08-18T09:15:00Z",
    journeyDuration: "1 day",
    events: [
      { id: "e9", eventType: "PRODUCT_VIEW", label: "Product View", occurredAt: "2026-08-17T11:00:00Z", productName: "Item #59481 (Category #790)" },
      { id: "e10", eventType: "PRODUCT_VIEW", label: "Product View", occurredAt: "2026-08-18T09:00:00Z", productName: "Item #156781 (Category #917)" },
      { id: "e11", eventType: "ADD_TO_CART", label: "Add to Cart", occurredAt: "2026-08-18T09:15:00Z", productName: "Item #59481 (Category #790)" },
    ],
  },
];

