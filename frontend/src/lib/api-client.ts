import type {
  ApiErrorPayload,
  ExportFormat,
  LocationSuggestionsResponse,
  RecordListResponse,
  RecordUpdateRequest,
  WeatherRecord,
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

async function parseApiError(response: Response): Promise<ApiClientError> {
  let parsed: ApiErrorPayload | null = null;

  try {
    parsed = (await response.json()) as ApiErrorPayload;
  } catch {
    parsed = null;
  }

  return new ApiClientError(
    parsed?.error?.message ?? "ForecastOS could not complete the request.",
    parsed?.error?.code ?? "API_ERROR",
    parsed?.error?.details,
  );
}

export async function fetchLocationSuggestions(
  query: string,
  limit = 8,
): Promise<LocationSuggestionsResponse> {
  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(limit),
  });
  const response = await fetch(
    `${API_BASE_URL}/weather/suggestions?${params.toString()}`,
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<LocationSuggestionsResponse>;
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
    throw await parseApiError(response);
  }

  return response.json() as Promise<WeatherSearchResponse>;
}

export async function listRecords(
  skip = 0,
  limit = 20,
): Promise<RecordListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/records?skip=${skip}&limit=${limit}`,
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<RecordListResponse>;
}

export async function getRecord(recordId: number): Promise<WeatherRecord> {
  const response = await fetch(`${API_BASE_URL}/records/${recordId}`);

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<WeatherRecord>;
}

export async function updateRecord(
  recordId: number,
  payload: RecordUpdateRequest,
): Promise<WeatherRecord> {
  const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<WeatherRecord>;
}

export async function deleteRecord(recordId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportRecords(
  format: ExportFormat,
  recordId?: number,
): Promise<void> {
  const path = recordId
    ? `${API_BASE_URL}/records/${recordId}/export?format=${format}`
    : `${API_BASE_URL}/export?format=${format}`;

  const response = await fetch(path);

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const filenameMatch = disposition?.match(/filename="(.+)"/);
  const filename =
    filenameMatch?.[1] ??
    (recordId
      ? `forecastos-record-${recordId}.${format === "markdown" ? "md" : format}`
      : `forecastos-records.${format === "markdown" ? "md" : format}`);

  downloadBlob(blob, filename);
}
