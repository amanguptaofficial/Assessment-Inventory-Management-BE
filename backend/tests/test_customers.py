def test_create_customer(client):
    resp = client.post(
        "/api/customers",
        json={"full_name": "John Smith", "email": "john@example.com", "phone": "555-9000"},
    )
    assert resp.status_code == 201
    assert resp.json()["email"] == "john@example.com"


def test_duplicate_email_rejected(client, customer):
    resp = client.post(
        "/api/customers",
        json={"full_name": "Another", "email": customer["email"], "phone": "555-1000"},
    )
    assert resp.status_code == 409


def test_invalid_email_rejected(client):
    resp = client.post(
        "/api/customers",
        json={"full_name": "Bad Email", "email": "not-an-email", "phone": "555-1000"},
    )
    assert resp.status_code == 422


def test_delete_customer(client, customer):
    assert client.delete(f"/api/customers/{customer['id']}").status_code == 204
    assert client.get(f"/api/customers/{customer['id']}").status_code == 404
