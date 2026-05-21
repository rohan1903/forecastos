def test_api_root(client):
    response = client.get("/api/v1")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["endpoints"]["health"] == "/api/v1/health"


def test_health_check(client):
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "ForecastOS API"
