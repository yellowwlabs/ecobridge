# EcoBridge

EcoBridge is a smart recycling platform that connects informal scrap collectors
with verified formal recyclers through an AI agent, machine-learning scrap
valuation, live pricing, smart matching, and end-to-end digital traceability.

## Tagline
"From Informal Collection to Formal Recycling"

## Tech Stack
- **Frontend:** React 19, Vite, Lucide React, CSS Custom Properties
- **Mobile Native:** Capacitor (Android)
- **Backend:** TypeScript, Express 5, PostgreSQL (`pg`), JWT auth
- **AI Agent:** Gemini function calling over 7 backend tools, with write approval
- **ML:** scikit-learn RandomForest pipelines served by Flask (`model/`)
- **Workspace:** pnpm workspaces + Turborepo, Makefile as the entry point

## Getting Started

```bash
make install              # pnpm install across the workspace + uv sync for model/
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
make db-migrate           # applies schema.sql + seed.sql (idempotent)
make train                # train the price + carbon pipelines (once)
make dev                  # model :5002 + backend :3001 + frontend :5173, together
```

`make dev` starts all three; Ctrl-C stops all three. To run the Flask ML
service on its own, use `make dev-model` (or `cd model && make serve`).

The backend reaches it at `MODEL_API_URL` (default `http://127.0.0.1:5002`).
It is optional — with the service down, the agent degrades to price-board
arithmetic instead of failing.

To load the synthetic collection dataset (7,500 rows across 60 pickup points)
from `model/__data__/`:

```bash
pnpm --filter @ecobridge/backend db:import-collections
```

`make` with no target lists everything available.

`DATABASE_URL` points at any PostgreSQL 14+ instance — local, Docker, or a
managed provider (either `DATABASE_SSL=true` or `?sslmode=require` in the URL).
Migrations also run automatically on server boot, so `make db-migrate` is only
needed to seed without starting the API.

### Make targets

| Target | Purpose |
| --- | --- |
| `make install` | pnpm install + `uv sync` in `model/` |
| `make dev` | Run the model service, backend and frontend together |
| `make dev-web` / `make dev-api` / `make dev-model` | Run one service only |
| `make train` | Train the price + carbon models (delegates to `model/`) |
| `make build` | Build every workspace |
| `make build-web` / `make build-api` | Build one side only |
| `make start` | Run the compiled backend |
| `make lint` / `make typecheck` / `make check` | Quality gates |
| `make db-migrate` | Apply schema and seed data |
| `make android` | Build the frontend and `cap sync android` |
| `make clean` | Remove build output and the Turbo cache |

Inside `model/` (uv-managed, separate from the pnpm workspace):

| Target | Purpose |
| --- | --- |
| `make install` | `uv sync` |
| `make train` | Train both pipelines (price + carbon) |
| `make serve` | Flask prediction API on :5002 |
| `make test` | pytest suite |
| `make lint` | ruff |
| `make notebooks` | Re-execute the EDA/training notebooks in place |

Every JS target delegates to Turbo or `pnpm --filter`, so `pnpm turbo run build`
and `pnpm --filter @ecobridge/backend dev` work directly too. Turbo caches
`build` and `typecheck`; `dev` and `db:migrate` are never cached.

## Repository Layout

```
.
├── frontend/               # React + Vite app (@ecobridge/frontend)
│   ├── src/
│   └── vite.config.js      # dev proxy: /api -> localhost:3001
├── backend/                # Express + PostgreSQL API (@ecobridge/backend)
├── model/                  # Python ML workspace (uv) + Flask service
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
│   │   ├── migrate.ts         # Applies schema then seed
│   │   └── importCollections.ts  # Loads the synthetic CSV into pickup points
│   ├── middleware/            # auth, rate limiting, error handling
│   ├── routes/                # One router per domain, mounted at /api/v1
│   ├── services/
│   │   ├── gemini.ts          # Gemini client (text, vision, function calling)
│   │   ├── agentTools.ts      # 7 tool declarations + their DB/ML executors
│   │   ├── agent.ts           # Tool-calling loop, write gating
│   │   ├── mlClient.ts        # Flask model client, 4s timeout, null on miss
│   │   └── slmDataset.ts      # PII-stripped fine-tuning dataset logger
│   ├── scripts/               # One-off dev utilities
│   ├── types/                 # Domain and Express type definitions
│   ├── utils/locale.ts        # en/hi/mr resolution
│   ├── app.ts                 # Express app assembly
│   └── server.ts              # Migrate, listen, graceful shutdown
└── data/                      # Generated PII-stripped fine-tuning dataset
```

### Frontend

Screen flows live under `src/components/` (auth, home, sell, history,
community, recycler, account). App-wide state is three contexts —
`AppDataContext`, `LanguageContext`, `ThemeContext`. The agent UI is
`hooks/useAgent.js` (conversation, tool trace, pending-action state),
`components/ai/AgentTrace.jsx` (collapsible tool steps + confirmation card),
and `components/common/VoiceModal.jsx`, which drives both through speech.
`utils/apiClient.js` is the single HTTP surface; `utils/offlineStore.js`
and `utils/haptics.js` cover offline queueing and native feedback.

## Agentic AI

`POST /api/v1/ai/agent` runs a Gemini function-calling loop (max 5 rounds)
over the live database and the trained models. It takes the conversation
history, so follow-up turns keep context ("and 20kg?" resolves against the
previous material), and answers in the caller's language (en / hi / mr).

Tools:

| Tool | Does |
| --- | --- |
| `get_price_board` | Live per-kg rates and the category ids other tools need |
| `estimate_scrap_value` | ML price prediction, chaining carbon → price |
| `find_recyclers` | Nearby yards with ratings, authorization, rate bonus |
| `get_my_impact` | This user's cumulative waste diverted and CO2 prevented |
| `get_loyalty_balance` | Point balance and its rupee value |
| `get_my_lots` | This user's lots and their status |
| `schedule_ewaste_pickup` | Books a pickup — **write, requires approval** |

Design notes worth knowing before editing:

- The system prompt forbids quoting a price, rate, or balance from memory.
  Every number in a reply comes from a tool result.
- Tools marked `mutates` never execute inline. The loop halts and returns a
  `pendingAction`; the frontend shows a confirmation card and re-posts it as
  `approvedAction` once the user accepts.
- Gemini's v1beta API rejects `role: 'function'`. Tool results go back as a
  **user** turn carrying `functionResponse` parts, and each model turn must be
  echoed back verbatim — including `thoughtSignature` — not reconstructed.
- `mlClient` returns `null` on timeout or error rather than throwing, so a
  down Flask service degrades the answer (`source: "price_board"`, flagged as
  approximate) instead of breaking the turn.

`POST /ai/query` remains as the single-shot, price-board-grounded Q&A path,
and `POST /ai/scan` does Gemini vision material identification from a photo.

## ML Models

Two sklearn `Pipeline`s (ColumnTransformer + RandomForestRegressor), trained
from `model/__data__/slm_synthetic_dataset_corrected.csv` (7,500 rows) and
pickled into `model/models/`:

| Task | Target | Artifact | Endpoint |
| --- | --- | --- | --- |
| `price` | `price_valuation_inr` | `rf_pipeline.pkl` | `POST /predict/price` |
| `carbon` | `estimated_carbon_emission_grams` | `rf_carbon_pipeline.pkl` | `POST /predict/carbon` |

Carbon predicts what price takes as an input feature, so the agent chains them:
carbon first, then price with that estimate filled in. Features are declared
once in `model/src/models/schema.py` — edit there and loaders, preprocessing,
training, and the API all follow.

`model/README.md` has the training commands, current metrics, and the list of
PII/identifier columns deliberately excluded from the feature set.
Notebooks: `notebooks/01_eda.ipynb`, `notebooks/02_train_evaluate.ipynb`.
Tests: `model/tests/` (pytest — pipeline, model, and API coverage).

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
| Collections | `GET /pickup-points`, `GET /pickup-points/:id`, `GET/POST /pickup-points/:id/collections`, `GET /pickup-points/:id/summary`, `GET /collections/stats` |
| Loyalty | `GET /loyalty/balance`, `POST /loyalty/convert-to-upi` |
| E-Waste | `GET /ewaste/impact-summary`, `GET/POST /ewaste/pickups` |
| Calls | `POST /ai-calls`, `GET /ai-calls/:id`, `POST /ai-calls/:id/end`, `POST /calls/initiate-proxy`, `GET /calls/proxy-session/:session_id`, `POST /calls/log-proxy-call` |
| Content | `GET /notifications`, `POST /notifications/:id/read`, `GET /faq`, `GET /community/feed` |
| Datasets | `GET /datasets/transactions`, `GET /datasets/training` |
| AI | `POST /ai/agent`, `POST /ai/query`, `POST /ai/scan` |

Requests without an `Authorization: Bearer <token>` header fall back to the
demo collector account so the app stays explorable while auth is wired up.

Responses are localized to English, Hindi, or Marathi via the
`Accept-Language` header or a `?locale=` query parameter, defaulting to Hindi.

## Environment

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | — | PostgreSQL connection string |
| `DATABASE_SSL` | no | `false` | `true` for managed providers |
| `JWT_SECRET` | yes | — | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | no | `30d` | Token lifetime |
| `PORT` | no | `3001` | Backend port |
| `GEMINI_API_KEY` | no | — | Without it, AI endpoints fall back to price-board answers |
| `GEMINI_MODEL` | no | `gemini-3.6-flash` | Model id |
| `MODEL_API_URL` | no | `http://127.0.0.1:5002` | Flask ML service |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | no | `60000` / `50` | AI endpoint rate limiting |
