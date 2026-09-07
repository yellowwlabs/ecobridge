import argparse
import os

import joblib
import pandas as pd

from .schema import TASKS

MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, TASKS["price"]["model_file"])
CARBON_MODEL_PATH = os.path.join(MODEL_DIR, TASKS["carbon"]["model_file"])


def model_path(task):
    return os.path.join(MODEL_DIR, TASKS[task]["model_file"])


def load_model(path_or_task=MODEL_PATH):
    path = model_path(path_or_task) if path_or_task in TASKS else path_or_task
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model not found at {path}, train first.")
    return joblib.load(path)


def predict_single(features, model, task="price"):
    cols = TASKS[task]["features"]
    missing = [c for c in cols if c not in features]
    if missing:
        raise ValueError(f"Missing features: {missing}")
    row = {c: features[c] for c in cols}
    return float(model.predict(pd.DataFrame([row]))[0])


def predict_from_csv(input_csv, output_csv, model, task="price"):
    spec = TASKS[task]
    df = pd.read_csv(input_csv)
    df[f"predicted_{spec['target']}"] = model.predict(df[spec["features"]])
    df.to_csv(output_csv, index=False)
    return output_csv


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict e-waste price (INR) or carbon emission (g)")
    parser.add_argument("--task", default="price", choices=list(TASKS))
    parser.add_argument("--model", default=None)
    parser.add_argument("--input", help="CSV for batch prediction")
    parser.add_argument("--output", default="predictions.csv")
    # union of both tasks' columns; only the chosen task's subset is required
    for col in dict.fromkeys(c for s in TASKS.values() for c in s["numeric"]):
        parser.add_argument(f"--{col}", type=float)
    for col in dict.fromkeys(c for s in TASKS.values() for c in s["categorical"]):
        parser.add_argument(f"--{col}", type=str)

    args = parser.parse_args()
    model = load_model(args.model or args.task)
    spec = TASKS[args.task]

    if args.input:
        print("Predictions saved to", predict_from_csv(args.input, args.output, model, args.task))
    else:
        values = {c: getattr(args, c) for c in spec["features"]}
        if any(v is None for v in values.values()):
            parser.error(f"provide all {args.task} features {spec['features']}, or use --input CSV")
        print(f"Predicted {spec['target']}: {predict_single(values, model, args.task):.2f}")
