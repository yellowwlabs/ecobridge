.DEFAULT_GOAL := help
.PHONY: help install install-model dev dev-web dev-api dev-model build build-web build-api start \
        lint typecheck check db-migrate train android clean

help: ## Show this help
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: install-model ## Install all workspace and model dependencies
	pnpm install

install-model: ## Sync the Python model environment (uv)
	$(MAKE) -C model install

dev: ## Run the model service, backend and frontend together
	@echo "starting Flask model service on :5002 ..."
	@trap 'kill 0' EXIT INT TERM; \
	  $(MAKE) -C model serve & \
	  pnpm turbo run dev

dev-web: ## Run only the frontend (Vite, :5173)
	pnpm --filter @ecobridge/frontend dev

dev-api: ## Run only the backend (Express, :3001)
	pnpm --filter @ecobridge/backend dev

dev-model: ## Run only the Flask model service (:5002)
	$(MAKE) -C model serve

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

train: ## Train the price and carbon models
	$(MAKE) -C model train

android: build-web ## Sync the built frontend into the Capacitor Android project
	pnpm exec cap sync android

clean: ## Remove build output and Turbo cache
	rm -rf frontend/dist backend/dist .turbo frontend/.turbo backend/.turbo
