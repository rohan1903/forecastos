import type {
  ApiErrorPayload,
  WeatherSearchRequest,
  WeatherSearchResponse,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class ApiClientError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, code = "API_ERROR", details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
  }
}

export async function searchWeather(
  payload: WeatherSearchRequest,
): Promise<WeatherSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/weather/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let parsed: ApiErrorPayload | null = null;

    try {
      parsed = (await response.json()) as ApiErrorPayload;
    } catch {
      parsed = null;
    }

    throw new ApiClientError(
      parsed?.error?.message ?? "ForecastOS could not complete the weather search.",
      parsed?.error?.code ?? "API_ERROR",
      parsed?.error?.details,
    );
  }

  return response.json() as Promise<WeatherSearchResponse>;
}
