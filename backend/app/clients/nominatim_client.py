from typing import Any

import httpx

from app.core.config import Settings


class NominatimClient:
    """OpenStreetMap Nominatim — used for states/regions OpenWeather geocoding misses."""

    BASE_URL = "https://nominatim.openstreetmap.org/search"

    def __init__(self, settings: Settings) -> None:
        self.timeout = settings.request_timeout_seconds
        self.user_agent = settings.nominatim_user_agent

    async def search(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        params = {
            "q": query.strip(),
            "format": "json",
            "limit": limit,
            "addressdetails": 1,
            "accept-language": "en",
        }
        headers = {
            "User-Agent": self.user_agent,
            "Accept-Language": "en",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    self.BASE_URL, params=params, headers=headers
                )
                response.raise_for_status()
        except httpx.HTTPError:
            return []

        data = response.json()
        return data if isinstance(data, list) else []
