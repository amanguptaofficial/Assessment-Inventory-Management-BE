def test_create_order_reduces_stock_and_computes_total(client, product, customer):
    resp = client.post(
        "/api/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 3}]},
    )
    assert resp.status_code == 201
    order = resp.json()
    assert float(order["total_amount"]) == 59.97
    assert order["items"][0]["quantity"] == 3

    prod = client.get(f"/api/products/{product['id']}").json()
    assert prod["quantity_in_stock"] == 47


def test_order_insufficient_stock_rejected(client, product, customer):
    resp = client.post(
        "/api/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 999}]},
    )
    assert resp.status_code == 409
    assert client.get(f"/api/products/{product['id']}").json()["quantity_in_stock"] == 50


def test_order_unknown_customer_rejected(client, product):
    resp = client.post(
        "/api/orders",
        json={"customer_id": 4242, "items": [{"product_id": product["id"], "quantity": 1}]},
    )
    assert resp.status_code == 404


def test_order_multi_product_total(client, customer):
    p1 = client.post(
        "/api/products",
        json={"name": "A", "sku": "A-1", "price": 10, "quantity_in_stock": 5},
    ).json()
    p2 = client.post(
        "/api/products",
        json={"name": "B", "sku": "B-1", "price": 2.5, "quantity_in_stock": 5},
    ).json()
    resp = client.post(
        "/api/orders",
        json={
            "customer_id": customer["id"],
            "items": [
                {"product_id": p1["id"], "quantity": 2},
                {"product_id": p2["id"], "quantity": 4},
            ],
        },
    )
    assert resp.status_code == 201
    assert float(resp.json()["total_amount"]) == 30.0


def test_delete_order_restocks(client, product, customer):
    order = client.post(
        "/api/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 5}]},
    ).json()
    assert client.get(f"/api/products/{product['id']}").json()["quantity_in_stock"] == 45

    assert client.delete(f"/api/orders/{order['id']}").status_code == 204
    assert client.get(f"/api/products/{product['id']}").json()["quantity_in_stock"] == 50


def test_empty_order_rejected(client, customer):
    resp = client.post("/api/orders", json={"customer_id": customer["id"], "items": []})
    assert resp.status_code == 422
