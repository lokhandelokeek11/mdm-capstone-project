# Development Guide

## Project Structure

### Frontend (`frontend/src/`)

```
app/           # App shell, router, providers
components/    # Reusable UI (ui/, layout/, common/, charts/, feedback/)
features/      # Feature modules (auth/, dashboard/, customers/, etc.)
hooks/         # TanStack Query hooks
lib/           # API client, auth, utils
types/         # TypeScript interfaces
schemas/       # Zod validation schemas
config/        # App configuration
styles/        # Global CSS
```

### Backend (`backend/src/`)

```
app/api/       # Next.js API route handlers
lib/           # Prisma, auth, JWT, env, logger
modules/       # Business logic by domain
repositories/  # Data access layer
schemas/       # Zod validation
utils/         # Errors, pagination, permissions
middleware.ts  # CORS middleware
```

## Adding a New Feature

1. **Database**: Add Prisma model, run migration
2. **Backend**: Create repository → service → API route
3. **Frontend**: Add types → API module → hook → page
4. **Mock data**: Add to `features/<module>/data/mock*.ts`

## Switching from Mock to Live API

In frontend hooks (e.g., `hooks/useCustomers.ts`), set:

```typescript
const USE_MOCK = false;
```

## Code Quality

- Run `npm run lint` and `npm run format` in both projects
- TypeScript strict mode enabled
- No `any` types unless unavoidable
- Keep route handlers thin — logic belongs in services

## Role Permissions

| Permission | ADMIN | ANALYST | MANAGER |
|-----------|-------|---------|---------|
| dashboard | ✓ | | ✓ |
| customers | ✓ | ✓ | ✓ |
| datasets | ✓ | | |
| models | ✓ | | |
| experiments | ✓ | ✓ | ✓ |

## Phase Roadmap

1. Data ingestion and preprocessing
2. Customer journey construction
3. Customer 360
4. Segmentation
5. Predictive intelligence
6. Next Best Marketing Action
7. Analytics and strategy evaluation
8. SaaS integrations
