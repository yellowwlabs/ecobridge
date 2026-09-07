"""Train each model once per session; API tests reuse the same fitted pipelines."""
import pytest

from src.api import api as api_module
from src.models.schema import TASKS
from src.models.train import train


@pytest.fixture(scope="session")
def models(tmp_path_factory):
    out = tmp_path_factory.mktemp("models")
    fitted = {}
    for task in TASKS:
        model, metrics = train(output_model=str(out / TASKS[task]["model_file"]), task=task)
        fitted[task] = (model, metrics)
    return fitted


@pytest.fixture
def client(models, monkeypatch):
    monkeypatch.setattr(api_module, "_models", {t: m for t, (m, _) in models.items()})
    api_module.app.config.update(TESTING=True)
    return api_module.app.test_client()


@pytest.fixture
def price_row():
    return {
        "weight_of_waste_grams": 61316.9,
        "number_of_ewaste_devices": 0,
        "estimated_carbon_emission_grams": 61076.1,
        "material_category": "PET Bottles",
        "price_trend": "Stable",
        "mode_of_transaction": "Cash",
        "recycler_location": "Guindy, Chennai",
        "authorization_status": "Authorized",
    }


@pytest.fixture
def carbon_row(price_row):
    return {k: v for k, v in price_row.items() if k != "estimated_carbon_emission_grams"}
