# EcoBridge

EcoBridge is a smart recycling platform that connects informal scrap collectors with verified formal recyclers through AI-powered scrap valuation, live pricing, smart matching, and end-to-end digital traceability.

## Tagline
"From Informal Collection to Formal Recycling"

## Tech Stack
- **Frontend:** React, Vite, Lucide React, CSS Custom Properties
- **Mobile Native:** Capacitor (Android & iOS)
- **Backend:** TypeScript, Express 5, PostgreSQL (`pg`), JWT auth
- **AI:** Gemini proxy with live price-board grounding

## Getting Started

```bash
make install              # pnpm install across the workspace
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
make db-migrate           # applies schema.sql + seed.sql (idempotent)
make dev                  # frontend :5173 + backend :3001, together
```

To load the synthetic collection dataset (7,500 rows across 60 pickup points)
from `model/__data__/`:

```bash
pnpm --filter @ecobridge/backend db:import-collections
```

`make` with no target lists everything available.

`DATABASE_URL` points at any PostgreSQL 14+ instance — local, Docker, or a
managed provider (either `DATABASE_SSL=true` or `?sslmode=require` in the URL).
Migrations also run
automatically on server boot, so `make db-migrate` is only needed to seed
without starting the API.

### Make targets

| Target | Purpose |
| --- | --- |
| `make dev` | Run frontend and backend together |
| `make dev-web` / `make dev-api` | Run one side only |
| `make build` | Build every workspace |
| `make build-web` / `make build-api` | Build one side only |
| `make start` | Run the compiled backend |
| `make lint` / `make typecheck` / `make check` | Quality gates |
| `make db-migrate` | Apply schema and seed data |
| `make android` | Build the frontend and `cap sync android` |
| `make clean` | Remove build output and the Turbo cache |

Every target delegates to Turbo or `pnpm --filter`, so `pnpm turbo run build`
and `pnpm --filter @ecobridge/backend dev` work directly too. Turbo caches
`build` and `typecheck`; `dev` and `db:migrate` are never cached.

## Repository Layout

This is a pnpm workspace orchestrated by Turborepo, with a Makefile as the
entry point.

```
.
├── frontend/               # React + Vite app (@ecobridge/frontend)
│   ├── index.html
│   ├── public/
│   ├── src/
│   └── vite.config.js      # dev proxy: /api -> localhost:3001
├── backend/                # Express + PostgreSQL API (@ecobridge/backend)
├── android/                # Capacitor native shell
├── capacitor.config.json   # webDir -> frontend/dist
├── turbo.json
└── Makefile
```

### Backend

```
backend/
├── src/
│   ├── config/env.ts          # Validated environment configuration
│   ├── db/
│   │   ├── pool.ts            # pg pool + query/transaction helpers
│   │   ├── schema.sql         # Idempotent DDL
│   │   ├── seed.sql           # Idempotent demo/reference data
│   │   └── migrate.ts         # Applies schema then seed
│   ├── middleware/            # auth, rate limiting, error handling
│   ├── routes/                # One router per domain, mounted at /api/v1
│   ├── services/              # Gemini client, SLM dataset logger
│   ├── scripts/               # One-off dev utilities
│   ├── types/                 # Domain and Express type definitions
│   ├── utils/locale.ts        # en/hi/mr resolution
│   ├── app.ts                 # Express app assembly
│   └── server.ts              # Migrate, listen, graceful shutdown
└── data/                      # Generated PII-stripped fine-tuning dataset
```

## API

All endpoints live under `/api/v1`. `GET /api/v1/health` reports service and
database status.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/otp/request`, `POST /auth/otp/verify`, `GET/PUT /me` |
| Rates | `GET /rates`, `GET /rates/:category_id/history` |
| Lots | `POST /lots`, `GET /lots`, `GET /lots/:id`, `POST /lots/:id/photo-scan` |
| Offers | `GET/POST /lots/:id/offers`, `POST /offers/:id/select` |
| Transactions | `GET /transactions/:id`, `POST /transactions/:id/confirm-handover`, `POST /transactions/:id/confirm-payment` |
| Recyclers | `GET /recyclers/nearby` |
| Certificates | `GET /certificates`, `GET /certificates/:transaction_id` |
| Loyalty | `GET /loyalty/balance`, `POST /loyalty/convert-to-upi` |
| E-Waste | `GET /ewaste/impact-summary`, `GET/POST /ewaste/pickups` |
| Calls | `POST /ai-calls`, `GET /ai-calls/:id`, `POST /ai-calls/:id/end`, `POST /calls/initiate-proxy`, `GET /calls/proxy-session/:session_id`, `POST /calls/log-proxy-call` |
| Content | `GET /notifications`, `POST /notifications/:id/read`, `GET /faq`, `GET /community/feed` |
| Datasets | `GET /datasets/transactions`, `GET /datasets/training` |
| AI | `POST /ai/query`, `POST /ai/scan` |

Requests without an `Authorization: Bearer <token>` header fall back to the
demo collector account so the app stays explorable while auth is wired up.

Responses are localized to English, Hindi, or Marathi via the
`Accept-Language` header or a `?locale=` query parameter, defaulting to Hindi.
