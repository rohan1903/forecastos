import csv
import io
import json
from typing import Any

from app.models.weather_record import WeatherRecord
from app.services.record_service import record_to_response


def _serialize_record(record: WeatherRecord) -> dict[str, Any]:
    return record_to_response(record).model_dump(mode="json")


def export_records_json(records: list[WeatherRecord]) -> dict[str, Any]:
    return {
        "exported_at": None,
        "count": len(records),
        "records": [_serialize_record(record) for record in records],
    }


def export_records_csv(records: list[WeatherRecord]) -> str:
    output = io.StringIO()
    fieldnames = [
        "id",
        "query",
        "input_type",
        "resolved_name",
        "country",
        "latitude",
        "longitude",
        "label",
        "notes",
        "temperature_c",
        "feels_like_c",
        "humidity",
        "pressure",
        "wind_speed",
        "visibility",
        "condition",
        "description",
        "aqi",
        "aqi_label",
        "risk_score",
        "risk_level",
        "summary",
        "created_at",
        "updated_at",
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for record in records:
        data = _serialize_record(record)
        row = {key: data.get(key) for key in fieldnames}
        writer.writerow(row)
    return output.getvalue()


def export_records_markdown(records: list[WeatherRecord]) -> str:
    if not records:
        return "# ForecastOS Export\n\nNo saved records found.\n"

    lines = ["# ForecastOS Weather Records Export", ""]
    for record in records:
        data = _serialize_record(record)
        lines.extend(
            [
                f"## {data['resolved_name']} ({data.get('country') or 'N/A'})",
                "",
                f"- **ID:** {data['id']}",
                f"- **Query:** {data['query']}",
                f"- **Label:** {data.get('label') or '—'}",
                f"- **Temperature:** {data.get('temperature_c')}°C",
                f"- **Condition:** {data.get('condition')} — {data.get('description')}",
                f"- **AQI:** {data.get('aqi')} ({data.get('aqi_label')})",
                f"- **Risk:** {data.get('risk_score')} ({data.get('risk_level')})",
                f"- **Summary:** {data.get('summary')}",
                f"- **Notes:** {data.get('notes') or '—'}",
                "",
            ]
        )
    return "\n".join(lines)
