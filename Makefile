.DEFAULT_GOAL := help
.PHONY: help install dev dev-web dev-api build build-web build-api start \
        lint typecheck check db-migrate android clean

help: ## Show this help
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install all workspace dependencies
	pnpm install

dev: ## Run frontend and backend together
	pnpm turbo run dev

dev-web: ## Run only the frontend (Vite, :5173)
	pnpm --filter @ecobridge/frontend dev

dev-api: ## Run only the backend (Express, :3001)
	pnpm --filter @ecobridge/backend dev

build: ## Build every workspace
	pnpm turbo run build

build-web: ## Build only the frontend
	pnpm --filter @ecobridge/frontend build

build-api: ## Compile only the backend
	pnpm --filter @ecobridge/backend build

start: build-api ## Run the compiled backend
	pnpm --filter @ecobridge/backend start

lint: ## Lint every workspace
	pnpm turbo run lint

typecheck: ## Type-check every workspace
	pnpm turbo run typecheck

check: lint typecheck ## Lint and type-check

db-migrate: ## Apply the database schema and seed data
	pnpm --filter @ecobridge/backend db:migrate

android: build-web ## Sync the built frontend into the Capacitor Android project
	pnpm exec cap sync android

clean: ## Remove build output and Turbo cache
	rm -rf frontend/dist backend/dist .turbo frontend/.turbo backend/.turbo
