import pytest


@pytest.mark.parametrize("export_format", ["json", "csv", "markdown"])
def test_export_all_formats(client, seeded_record, export_format):
    response = client.get(f"/api/v1/export?format={export_format}")

    assert response.status_code == 200
    assert "attachment" in response.headers.get("content-disposition", "").lower()
    assert f"forecastos-records.{_extension_for(export_format)}" in response.headers[
        "content-disposition"
    ]
    assert len(response.content) > 0


def test_export_single_record_json(client, seeded_record):
    response = client.get(f"/api/v1/records/{seeded_record.id}/export?format=json")

    assert response.status_code == 200
    assert f"forecastos-record-{seeded_record.id}.json" in response.headers[
        "content-disposition"
    ]
    assert b"London" in response.content


def _extension_for(export_format: str) -> str:
    return {"json": "json", "csv": "csv", "markdown": "md"}[export_format]
