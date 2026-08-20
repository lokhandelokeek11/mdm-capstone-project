# Frontend

React + TypeScript + Vite application for Customer Journey Intelligence.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Runs at http://localhost:5173

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Mock Data

Hooks use mock data by default (`USE_MOCK = true` in `src/hooks/`). Set to `false` to use the live backend API.
