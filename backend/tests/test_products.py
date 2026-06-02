def test_create_and_get_product(client):
    resp = client.post(
        "/api/products",
        json={"name": "Keyboard", "sku": "KB-100", "price": 49.5, "quantity_in_stock": 20},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["sku"] == "KB-100"
    assert body["id"] > 0

    get_resp = client.get(f"/api/products/{body['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Keyboard"


def test_duplicate_sku_rejected(client, product):
    resp = client.post(
        "/api/products",
        json={"name": "Other", "sku": product["sku"], "price": 5, "quantity_in_stock": 1},
    )
    assert resp.status_code == 409


def test_negative_quantity_rejected(client):
    resp = client.post(
        "/api/products",
        json={"name": "Bad", "sku": "NEG-1", "price": 5, "quantity_in_stock": -3},
    )
    assert resp.status_code == 422


def test_update_product(client, product):
    resp = client.put(f"/api/products/{product['id']}", json={"price": 25.00})
    assert resp.status_code == 200
    assert float(resp.json()["price"]) == 25.00


def test_delete_product(client, product):
    assert client.delete(f"/api/products/{product['id']}").status_code == 204
    assert client.get(f"/api/products/{product['id']}").status_code == 404


def test_get_missing_product_returns_404(client):
    assert client.get("/api/products/9999").status_code == 404
