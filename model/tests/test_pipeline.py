"""One runnable check: train on the real CSV, then round-trip a prediction."""
import os
import tempfile

from src.models.predict import load_model, predict_single
from src.models.schema import FEATURES
from src.models.train import train


def test_train_and_predict():
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "rf.pkl")
        _, metrics = train(output_model=path)
        assert metrics["R2"] > 0.5, metrics
        assert os.path.exists(path)

        model = load_model(path)
        row = {
            "weight_of_waste_grams": 61316.9,
            "number_of_ewaste_devices": 0,
            "estimated_carbon_emission_grams": 61076.1,
            "material_category": "PET Bottles",
            "price_trend": "Stable",
            "mode_of_transaction": "Cash",
            "recycler_location": "Guindy, Chennai",
            "authorization_status": "Authorized",
        }
        assert set(row) == set(FEATURES)
        assert predict_single(row, model) > 0


if __name__ == "__main__":
    test_train_and_predict()
    print("ok")
