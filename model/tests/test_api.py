import pytest

from src.models.schema import CARBON_TARGET, TARGET


def test_home_lists_both_tasks(client):
    body = client.get("/").get_json()
    assert set(body["tasks"]) == {"price", "carbon"}
    assert "/predict/price (POST)" in body["endpoints"]
    assert "/predict/carbon (POST)" in body["endpoints"]
    assert CARBON_TARGET not in body["tasks"]["carbon"]["required_features"]["numeric"]


def test_predict_price(client, price_row):
    res = client.post("/predict/price", json=price_row)
    assert res.status_code == 200
    assert res.get_json()[f"predicted_{TARGET}"] > 0


def test_predict_carbon(client, carbon_row):
    res = client.post("/predict/carbon", json=carbon_row)
    assert res.status_code == 200
    assert res.get_json()[f"predicted_{CARBON_TARGET}"] > 0


def test_endpoints_are_independent(client, price_row, carbon_row):
    """Price no longer chains carbon: it demands the real reading."""
    res = client.post("/predict/price", json=carbon_row)
    assert res.status_code == 400
    assert CARBON_TARGET in res.get_json()["error"]


@pytest.mark.parametrize("path", ["/predict/price", "/predict/carbon"])
def test_empty_body_rejected(client, path):
    assert client.post(path, json={}).get_json()["error"] == "No JSON body provided"


@pytest.mark.parametrize("path", ["/predict/price", "/predict/carbon"])
def test_missing_features_listed(client, path):
    res = client.post(path, json={"weight_of_waste_grams": 100})
    assert res.status_code == 400
    assert "material_category" in res.get_json()["error"]


def test_non_numeric_value_is_400_not_500(client, price_row):
    res = client.post("/predict/price", json={**price_row, "weight_of_waste_grams": "heavy"})
    assert res.status_code == 400


def test_get_not_allowed(client):
    assert client.get("/predict/price").status_code == 405
