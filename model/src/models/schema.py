"""Single source of truth for what the models look at."""

TARGET = "price_valuation_inr"

NUMERIC_FEATURES = [
    "weight_of_waste_grams",
    "number_of_ewaste_devices",
    "estimated_carbon_emission_grams",
]

CATEGORICAL_FEATURES = [
    "material_category",
    "price_trend",
    "mode_of_transaction",
    "recycler_location",
    "authorization_status",
]

FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES

# Carbon task: predicts what the price task takes as an input feature,
# so it must not use that column as a feature.
CARBON_TARGET = "estimated_carbon_emission_grams"

CARBON_NUMERIC_FEATURES = [c for c in NUMERIC_FEATURES if c != CARBON_TARGET]
CARBON_CATEGORICAL_FEATURES = list(CATEGORICAL_FEATURES)
CARBON_FEATURES = CARBON_NUMERIC_FEATURES + CARBON_CATEGORICAL_FEATURES

TASKS = {
    "price": {
        "target": TARGET,
        "numeric": NUMERIC_FEATURES,
        "categorical": CATEGORICAL_FEATURES,
        "features": FEATURES,
        "model_file": "rf_pipeline.pkl",
    },
    "carbon": {
        "target": CARBON_TARGET,
        "numeric": CARBON_NUMERIC_FEATURES,
        "categorical": CARBON_CATEGORICAL_FEATURES,
        "features": CARBON_FEATURES,
        "model_file": "rf_carbon_pipeline.pkl",
    },
}
