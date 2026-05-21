from app.services.weather_service import (
    _english_geocode_name,
    _nominatim_display_label,
    _nominatim_place_name,
)


def test_english_geocode_name_prefers_local_names_en() -> None:
    result = {
        "name": "東京",
        "local_names": {"en": "Tokyo", "ja": "東京", "ascii": "Tokyo"},
    }
    assert _english_geocode_name(result, "fallback") == "Tokyo"


def test_english_geocode_name_falls_back_to_ascii() -> None:
    result = {"name": "東京", "local_names": {"ascii": "Tokyo", "ja": "東京"}}
    assert _english_geocode_name(result, "fallback") == "Tokyo"


def test_nominatim_place_name_uses_address_city() -> None:
    result = {
        "name": "東京都",
        "address": {"city": "Tokyo", "state": "Tokyo", "country": "Japan"},
    }
    assert _nominatim_place_name(result) == "Tokyo"


def test_nominatim_display_label_builds_english_address_parts() -> None:
    result = {
        "display_name": "東京, 日本",
        "address": {"city": "Tokyo", "state": "Tokyo", "country": "Japan"},
    }
    assert _nominatim_display_label(result) == "Tokyo, Japan"
