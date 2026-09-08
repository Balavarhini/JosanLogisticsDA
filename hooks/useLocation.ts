import { useCallback, useEffect, useRef, useState } from "react";
import * as locationService from "@services/location";
import type { TrackedLocation } from "@/types/location";

interface UseLocationResult {
  location: TrackedLocation | null;
  permission: locationService.PermissionState | "loading";
  error: string | null;
  requestPermission: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Provides the driver's current location on demand. Screens that need
 * continuous tracking (Live Tracking) should use useLiveTracking instead.
 */
export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<TrackedLocation | null>(null);
  const [permission, setPermission] = useState<locationService.PermissionState | "loading">("loading");
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    const status = await locationService.requestForegroundPermission();
    setPermission(status);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const current = await locationService.getCurrentLocation();
      setLocation(current);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to get current location.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const status = await locationService.getForegroundPermissionStatus();
      setPermission(status);
      if (status === "granted") await refresh();
    })();
  }, [refresh]);

  return { location, permission, error, requestPermission, refresh };
}

interface UseLiveTrackingResult {
  location: TrackedLocation | null;
  isTracking: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Subscribes to continuous location updates and (optionally) reports them to
 * the backend for a given trip, for the Live Tracking screen.
 */
export function useLiveTracking(tripId?: string): UseLiveTrackingResult {
  const [location, setLocation] = useState<TrackedLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    setIsTracking(false);
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      const status = await locationService.requestForegroundPermission();
      if (status !== "granted") {
        setError("Location permission is required for live tracking.");
        return;
      }
      const unsubscribe = await locationService.watchLocation((next) => {
        setLocation(next);
        if (tripId) locationService.reportLocation(tripId, next);
      });
      unsubscribeRef.current = unsubscribe;
      setIsTracking(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start live tracking.");
    }
  }, [tripId]);

  useEffect(() => stop, [stop]);

  return { location, isTracking, error, start, stop };
}
