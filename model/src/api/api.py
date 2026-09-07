from flask import Flask, jsonify, request

from ..models.predict import load_model, predict_single
from ..models.schema import TASKS

app = Flask(__name__)
_models = {}


def get_model(task):
    if task not in _models:
        _models[task] = load_model(task)
    return _models[task]


@app.get("/")
def home():
    return jsonify({
        "message": "E-Waste Prediction API",
        "endpoints": ["/predict/price (POST)", "/predict/carbon (POST)"],
        "tasks": {
            task: {
                "target": spec["target"],
                "required_features": {"numeric": spec["numeric"], "categorical": spec["categorical"]},
            }
            for task, spec in TASKS.items()
        },
    })


def _run(task):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400
    try:
        value = predict_single(data, get_model(task), task)
    except (ValueError, TypeError) as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({f"predicted_{TASKS[task]['target']}": round(value, 2)})


@app.post("/predict/price")
def predict_price():
    return _run("price")


@app.post("/predict/carbon")
def predict_carbon():
    return _run("carbon")
