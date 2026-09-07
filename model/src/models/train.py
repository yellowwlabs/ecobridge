import argparse
import json
import os

import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from .data_loader import load_data
from .preprocess import build_preprocessor
from .schema import TASKS

DEFAULT_DATA = os.path.join("__data__", "slm_synthetic_dataset_corrected.csv")
MODEL_DIR = "models"


def model_path(task):
    return os.path.join(MODEL_DIR, TASKS[task]["model_file"])


def train(data_path=DEFAULT_DATA, output_model=None, test_size=0.2, seed=42, task="price"):
    spec = TASKS[task]
    features, target = spec["features"], spec["target"]
    output_model = output_model or model_path(task)

    df = load_data(data_path)
    missing = [c for c in features + [target] if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset missing columns: {missing}")

    X, y = df[features], df[target]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=seed
    )

    model = Pipeline([
        ("preprocessor", build_preprocessor(spec["numeric"], spec["categorical"])),
        ("regressor", RandomForestRegressor(n_estimators=200, random_state=seed, n_jobs=-1)),
    ])
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    metrics = {
        "MAE": float(mean_absolute_error(y_test, preds)),
        "MSE": float(mean_squared_error(y_test, preds)),
        "RMSE": float(mean_squared_error(y_test, preds) ** 0.5),
        "R2": float(r2_score(y_test, preds)),
    }

    os.makedirs(os.path.dirname(output_model) or ".", exist_ok=True)
    joblib.dump(model, output_model)
    return model, metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train e-waste regression models")
    parser.add_argument("--data", default=DEFAULT_DATA)
    parser.add_argument("--output_model", default=None)
    parser.add_argument("--task", default="price", choices=list(TASKS) + ["all"])
    args = parser.parse_args()

    tasks = list(TASKS) if args.task == "all" else [args.task]
    for task in tasks:
        out = args.output_model if len(tasks) == 1 else None
        _, metrics = train(args.data, out, task=task)
        print(f"[{task}] target={TASKS[task]['target']}")
        print("Evaluation metrics:", json.dumps(metrics, indent=2))
        print("Saved model to", out or model_path(task))
