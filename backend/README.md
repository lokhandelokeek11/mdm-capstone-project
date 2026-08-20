# Backend

Next.js API server with Prisma ORM and PostgreSQL.

## Setup

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Runs at http://localhost:3000

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run db:generate` — Generate Prisma client
- `npm run db:migrate` — Run migrations
- `npm run db:seed` — Seed demo data
- `npm run db:studio` — Prisma Studio GUI

## Architecture

Route Handler → Service → Repository → Prisma → PostgreSQL
