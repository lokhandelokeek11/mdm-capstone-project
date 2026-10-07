# Customer Journey Intelligence

AI-driven customer journey intelligence platform for personalized digital marketing.

## Project Overview

This platform analyzes customer behavioral events, constructs chronological customer journeys, identifies journey stages, segments customers, predicts future behavior, recommends Next Best Marketing Actions (NBMA), and provides explainable marketing analytics.

## Architecture

```
customer-journey-intelligence/
├── frontend/     # React + Vite + TypeScript (UI)
├── backend/      # Next.js API server + Prisma + PostgreSQL
├── ml/           # RetailRocket ML study (RQ1–RQ4), train_models.py
├── data/artifacts/  # research_results.json, model_metrics.json (generated)
├── docs/         # Architecture documentation
└── docker-compose.yml  # Optional PostgreSQL for local dev
```

**Two separate applications** — frontend and backend run independently and communicate via HTTP APIs.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Axios, React Hook Form, Zod, Recharts |
| Backend | Next.js 16, TypeScript, App Router, Prisma ORM, PostgreSQL, Zod, bcrypt, JWT |
| Database | PostgreSQL 16 |

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL (or Docker)

### 1. Start Database (optional Docker)

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Backend runs at **http://localhost:3000**

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo-retail.com | Password123! |
| Marketing Analyst | analyst@demo-retail.com | Password123! |
| Marketing Manager | manager@demo-retail.com | Password123! |

## Prisma Commands

```bash
cd backend
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed demo data
npx prisma studio        # Open database GUI
npm run ml:import        # Load data/artifacts into PostgreSQL (after training)
```

## Machine learning (synopsis study)

Place RetailRocket `events.csv` under `data/raw/retailrocket/`, then:

```bash
pip install -r ml/requirements.txt
python ml/train_models.py
```

See [ml/README.md](ml/README.md). The admin **Model Evaluation** page reads `GET /api/models/research` for RQ1–RQ4 tables.

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://cji_user:cji_password@localhost:5432/customer_journey_intelligence
JWT_SECRET=your-secret-min-32-characters-long
NEXT_PUBLIC_APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Development Guidelines

- Frontend uses **mock data** by default (`USE_MOCK = true` in hooks). Set to `false` to use live API.
- Backend follows Route Handler → Service → Repository → Prisma pattern.
- All tenant-owned data includes `organizationId` for multi-tenant isolation.
- ML modules are placeholders — no fake predictions in backend services.

## Documentation

- [Architecture](docs/architecture.md)
- [Database Schema](docs/database.md)
- [API Reference](docs/api.md)
- [Development Guide](docs/development-guide.md)

## License

B.Tech Capstone Project — Academic Use
