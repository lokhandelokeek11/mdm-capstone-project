# Database Schema

## Core Models

| Model | Purpose |
|-------|---------|
| Organization | Tenant root entity |
| User | Authenticated users with roles |
| Customer | End customers within an organization |
| Session | Browsing sessions |
| Event | Behavioral events (standardized EventType enum) |
| Product | Product catalog |
| Transaction | Purchase transactions |
| CustomerFeature | Computed behavioral features |
| JourneyStage | Journey stage definitions |
| Segment | Customer segments |
| CustomerSegment | Customer-to-segment assignments |
| Prediction | ML predictions |
| ModelVersion | ML model versions |
| RecommendedAction | Next best marketing actions |
| ProductRecommendation | Product recommendations |
| Dataset | Data import sources |
| DatasetColumn | Dataset column metadata |
| StrategyExperiment | A/B experiments |
| ExperimentResult | Experiment metrics |
| AuditLog | Audit trail |

## Event Types

```
PRODUCT_VIEW, SEARCH, CLICK, FAVORITE, ADD_TO_CART,
REMOVE_FROM_CART, PURCHASE, EMAIL_CLICK, AD_CLICK,
SESSION_START, SESSION_END
```

## Tenant Isolation

All customer-facing data includes `organizationId`. Queries must always filter by the authenticated user's organization.

## Indexes

Key indexes on:
- `organizationId` (all tenant tables)
- `customerId`, `sessionId`, `eventType`
- `organizationId + occurredAt` (time-range queries)
- `email` (users), `slug` (organizations)

## Enums

- `UserRole`: ADMIN, MARKETING_ANALYST, MARKETING_MANAGER
- `EventType`: 11 standardized event types
- `JourneyStageType`: AWARENESS through INACTIVE
- `RecommendedActionType`: WAIT through STOP_MARKETING
- `PredictionType`: NEXT_EVENT, PURCHASE_PROPENSITY, CHURN_RISK, INACTIVITY_RISK
