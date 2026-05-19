export type WeatherInputType = "query" | "coordinates";

export type WeatherSearchRequest = {
  query?: string;
  input_type?: WeatherInputType;
  latitude?: number;
  longitude?: number;
  save?: boolean;
  label?: string;
  notes?: string;
};

export type LocationResponse = {
  name: string;
  country?: string | null;
  state?: string | null;
  latitude: number;
  longitude: number;
};

export type CurrentWeatherResponse = {
  temperature_c: number;
  feels_like_c: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  visibility?: number | null;
  condition: string;
  description: string;
  icon?: string | null;
  sunrise?: string | null;
  sunset?: string | null;
  observed_at: string;
};

export type AirQualityResponse = {
  aqi: number;
  label: string;
  components: Record<string, number>;
};

export type ForecastPointResponse = {
  forecast_at: string;
  temperature_c: number;
  feels_like_c: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  description: string;
  icon?: string | null;
  precipitation_probability?: number | null;
};

export type WeatherIntelligenceResponse = {
  risk_score: number;
  risk_level: string;
  summary: string;
  recommendations: string[];
  clothing: string;
  anomalies: string[];
};

export type WeatherSearchResponse = {
  record_id?: number | null;
  location: LocationResponse;
  current: CurrentWeatherResponse;
  air_quality: AirQualityResponse;
  forecast: ForecastPointResponse[];
  intelligence: WeatherIntelligenceResponse;
};

export type ApiErrorPayload = {
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};
