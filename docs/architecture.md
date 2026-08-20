# Architecture

## System Overview

```
┌─────────────┐     HTTP/REST      ┌─────────────┐     Prisma      ┌────────────┐
│   Frontend  │ ◄──────────────► │   Backend   │ ◄─────────────► │ PostgreSQL │
│  React/Vite │                   │   Next.js   │                 │            │
└─────────────┘                   └─────────────┘                 └────────────┘
```

## Multi-Tenant Hierarchy

```
Organization
    ↓
Users (ADMIN, MARKETING_ANALYST, MARKETING_MANAGER)
    ↓
Customer Data (Customers, Sessions, Events)
    ↓
Journeys (Journey Stages, Features)
    ↓
Predictions (ML Models, Predictions)
    ↓
Recommendations (Next Best Actions, Product Recommendations)
```

## Backend Layers

```
API Route Handler
    ↓
Service (business logic)
    ↓
Repository (data access)
    ↓
Prisma ORM
    ↓
PostgreSQL
```

## Future Data Flow (SaaS)

```
Website → Tracking SDK → Event API → Event Processing
    → Customer Identity → Customer Journey → Customer 360
    → AI/ML → Next Best Action → Marketing Activation → Outcome Tracking
```

## Prediction vs Decision vs Outcome

| Concept | Question | Layer |
|---------|----------|-------|
| Prediction | What is the customer likely to do? | ML Engine |
| Decision | What should the marketer do? | Decision Engine |
| Outcome | What actually happened? | Evaluation |

## ML Extension Points

Located in `backend/src/modules/ml/`:

- `segmentation/` — Customer segmentation
- `purchase-propensity/` — Purchase probability
- `next-event/` — Next event prediction
- `risk/` — Churn and inactivity risk
- `recommendation/` — Product recommendations
- `explainability/` — Model explanations

## Dataset Architecture

No hardcoded data sources. Uses adapter pattern:

- `DatasetAdapter` — Source-specific parsing
- `EventNormalizer` — Standardize event names
- `DataSource` — Connect to external sources

Supported source types: CSV, JSON, REST API, Web Tracking, External.
