# E-Waste Price Valuation Model

Predicts `price_valuation_inr` for a scrap/e-waste drop-off from weight, device
count, carbon estimate, material category, price trend, transaction mode,
recycler location, and authorization status.

Same shape as [cow-yield-model](https://github.com/samarth3301/cow-yield-model):
sklearn `Pipeline` (ColumnTransformer + RandomForestRegressor) pickled to
`models/rf_pipeline.pkl`, served over Flask.

## Layout

```
model/
├── __data__/slm_synthetic_dataset_corrected.csv   # 7500 rows
├── models/rf_pipeline.pkl                         # trained artifact
├── src/models/
│   ├── schema.py        # TARGET + FEATURES — edit here, everything follows
│   ├── data_loader.py
│   ├── preprocess.py    # impute + scale numeric, impute + one-hot categorical
│   ├── train.py
│   ├── predict.py
│   └── utils.py
├── src/api/api.py       # Flask, port 5002
└── test_pipeline.py     # trains + predicts, asserts R2 > 0.5
```

## Use

```bash
uv sync

# train (defaults to __data__ CSV -> models/rf_pipeline.pkl)
uv run python -m src.models.train

# single prediction
uv run python -m src.models.predict \
  --weight_of_waste_grams 61316.9 \
  --number_of_ewaste_devices 0 \
  --estimated_carbon_emission_grams 61076.1 \
  --material_category "PET Bottles" \
  --price_trend Stable \
  --mode_of_transaction Cash \
  --recycler_location "Guindy, Chennai" \
  --authorization_status Authorized

# batch
uv run python -m src.models.predict --input rows.csv --output predictions.csv

# API
uv run python -m src.api.api        # POST /predict with the 8 features as JSON

# check
uv run python test_pipeline.py
```

## Current metrics

| MAE | RMSE | R² |
|---|---|---|
| 175.54 | 555.42 | 0.9977 |

R² this high means the synthetic data derives price almost deterministically
from weight × material rate. Expect it to drop hard on real collection data.

## Excluded columns

`user_name` and `anonymous_contact_number` are PII. `reference_id`,
`transaction_id`, `ewaste_scrap_image_ref`, `nearby_recycler_id`, and
`recycler_name` are per-row identifiers that leak rather than generalize.
See `src/models/schema.py`.
