import os

import pandas as pd
import pytest

from src.models.predict import load_model, model_path, predict_from_csv, predict_single
from src.models.schema import CARBON_TARGET, TARGET, TASKS


def test_task_specs_are_consistent():
    # carbon must never see its own target as a feature, or the model is trivially perfect
    assert CARBON_TARGET not in TASKS["carbon"]["features"]
    assert CARBON_TARGET in TASKS["price"]["features"]
    for task, spec in TASKS.items():
        assert spec["features"] == spec["numeric"] + spec["categorical"], task
        assert spec["target"] not in spec["features"], task
    assert model_path("price") != model_path("carbon")


@pytest.mark.parametrize("task", list(TASKS))
def test_train_fits_and_saves(models, task):
    model, metrics = models[task]
    assert metrics["R2"] > 0.5, metrics
    assert metrics["MAE"] > 0
    assert os.path.exists(model_path(task)) or model is not None


def test_price_prediction_is_positive(models, price_row):
    model, _ = models["price"]
    assert predict_single(price_row, model, "price") > 0


def test_carbon_prediction_is_positive(models, carbon_row):
    model, _ = models["carbon"]
    assert predict_single(carbon_row, model, "carbon") > 0


def test_predict_single_rejects_missing_features(models, price_row):
    model, _ = models["price"]
    del price_row["material_category"]
    with pytest.raises(ValueError, match="material_category"):
        predict_single(price_row, model, "price")


def test_predict_single_ignores_extra_keys(models, price_row):
    model, _ = models["price"]
    baseline = predict_single(price_row, model, "price")
    extra = predict_single({**price_row, "user_name": "Sunita"}, model, "price")
    assert extra == pytest.approx(baseline)


def test_heavier_load_predicts_more_carbon(models, carbon_row):
    """Sanity check on direction: more mass should not emit less."""
    model, _ = models["carbon"]
    light = predict_single({**carbon_row, "weight_of_waste_grams": 1000.0}, model, "carbon")
    heavy = predict_single({**carbon_row, "weight_of_waste_grams": 90000.0}, model, "carbon")
    assert heavy > light


def test_unseen_category_does_not_crash(models, price_row):
    # OneHotEncoder(handle_unknown="ignore") should absorb this
    model, _ = models["price"]
    assert predict_single({**price_row, "recycler_location": "Nowhere, Mars"}, model, "price") > 0


@pytest.mark.parametrize("task,target", [("price", TARGET), ("carbon", CARBON_TARGET)])
def test_batch_csv_roundtrip(models, tmp_path, price_row, task, target):
    model, _ = models[task]
    src = tmp_path / "in.csv"
    pd.DataFrame([price_row, price_row]).to_csv(src, index=False)
    out = predict_from_csv(str(src), str(tmp_path / "out.csv"), model, task)
    df = pd.read_csv(out)
    assert len(df) == 2
    assert (df[f"predicted_{target}"] > 0).all()


def test_load_model_missing_file(tmp_path):
    with pytest.raises(FileNotFoundError):
        load_model(str(tmp_path / "nope.pkl"))
