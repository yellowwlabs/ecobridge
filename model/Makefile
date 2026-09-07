UV := uv run

.PHONY: help install train serve test lint clean notebooks

help:
	@grep -E '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) | sed 's/:.*## /\t/'

install: ## sync deps
	uv sync

train: ## train both models (price + carbon)
	$(UV) python -m src.models.train --task all

serve: ## run flask API on :5002
	$(UV) python -m src.main

test: ## run pytest suite
	$(UV) pytest -q

lint: ## ruff check
	$(UV) ruff check .

clean: ## drop trained artifacts
	rm -rf models/*.pkl models/*.json

notebooks: ## execute notebooks in place (refreshes stored outputs)
	$(UV) jupyter nbconvert --to notebook --execute --inplace notebooks/*.ipynb
