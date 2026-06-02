"""Tests for the dashboard summary endpoint."""


def test_dashboard_summary(client, customer):
    client.post(
        "/api/products",
        json={"name": "Low", "sku": "LOW-1", "price": 1, "quantity_in_stock": 2},
    )
    client.post(
        "/api/products",
        json={"name": "High", "sku": "HIGH-1", "price": 1, "quantity_in_stock": 500},
    )

    resp = client.get("/api/dashboard/summary")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_products"] == 2
    assert body["total_customers"] == 1
    assert body["total_orders"] == 0
    # only the product with stock <= threshold (10) is low
    assert body["low_stock_count"] == 1
    assert body["low_stock_products"][0]["sku"] == "LOW-1"
