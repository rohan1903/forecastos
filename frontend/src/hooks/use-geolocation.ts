"use client";

import { useCallback, useState } from "react";

type GeolocationResult = {
  latitude: number;
  longitude: number;
};

type UseGeolocationState = {
  isLocating: boolean;
  error: string | null;
  clearError: () => void;
  getCurrentPosition: () => Promise<GeolocationResult>;
};

export function useGeolocation(): UseGeolocationState {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCurrentPosition = useCallback(() => {
    return new Promise<GeolocationResult>((resolve, reject) => {
      if (!navigator.geolocation) {
        const message = "Geolocation is not supported in this browser.";
        setError(message);
        reject(new Error(message));
        return;
      }

      setIsLocating(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (geoError) => {
          setIsLocating(false);
          let message = "Could not determine your current location.";
          if (geoError.code === geoError.PERMISSION_DENIED) {
            message =
              "Location permission was denied. Allow location access and try again.";
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            message = "Location information is unavailable right now.";
          } else if (geoError.code === geoError.TIMEOUT) {
            message = "Location request timed out. Please try again.";
          }
          setError(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
      );
    });
  }, []);

  return { isLocating, error, clearError, getCurrentPosition };
}
