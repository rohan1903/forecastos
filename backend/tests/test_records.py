def test_list_records_empty(client):
    response = client.get("/api/v1/records")

    assert response.status_code == 200
    payload = response.json()
    assert payload["items"] == []
    assert payload["total"] == 0


def test_list_and_get_record(client, seeded_record):
    list_response = client.get("/api/v1/records")

    assert list_response.status_code == 200
    items = list_response.json()["items"]
    assert len(items) == 1
    assert items[0]["id"] == seeded_record.id
    assert items[0]["label"] == "Trip planning"

    get_response = client.get(f"/api/v1/records/{seeded_record.id}")

    assert get_response.status_code == 200
    assert get_response.json()["resolved_name"] == "London"


def test_patch_record(client, seeded_record):
    response = client.patch(
        f"/api/v1/records/{seeded_record.id}",
        json={"label": "Updated label", "notes": "Updated notes"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["label"] == "Updated label"
    assert payload["notes"] == "Updated notes"


def test_delete_record(client, seeded_record):
    delete_response = client.delete(f"/api/v1/records/{seeded_record.id}")

    assert delete_response.status_code == 204

    get_response = client.get(f"/api/v1/records/{seeded_record.id}")
    assert get_response.status_code == 404
    assert get_response.json()["error"]["code"] == "RECORD_NOT_FOUND"


def test_get_missing_record_returns_404(client):
    response = client.get("/api/v1/records/99999")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "RECORD_NOT_FOUND"
