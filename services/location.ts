/**
 * Wraps expo-location so screens/hooks never call the Location API directly.
 * Handles permission requests and normalizes results to our TrackedLocation type.
 */
import * as Location from "expo-location";
import { api } from "./api";
import type { GeoPoint, RouteEstimate, TrackedLocation } from "@/types/location";
import { distanceBetweenKm } from "@/utils/format";

export type PermissionState = "granted" | "denied" | "undetermined";

export async function requestForegroundPermission(): Promise<PermissionState> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status as PermissionState;
}

export async function getForegroundPermissionStatus(): Promise<PermissionState> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status as PermissionState;
}

export async function getCurrentLocation(): Promise<TrackedLocation> {
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    heading: position.coords.heading,
    speedKph: position.coords.speed != null ? position.coords.speed * 3.6 : null,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  };
}

/**
 * Subscribes to live location updates (e.g. for the Live Tracking screen).
 * Returns an unsubscribe function — always call it on unmount.
 */
export async function watchLocation(
  onUpdate: (location: TrackedLocation) => void,
  intervalMs = 5000
): Promise<() => void> {
  const subscription = await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.High, timeInterval: intervalMs, distanceInterval: 15 },
    (position) => {
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        heading: position.coords.heading,
        speedKph: position.coords.speed != null ? position.coords.speed * 3.6 : null,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    }
  );
  return () => subscription.remove();
}

/**
 * Reports the driver's current position to the backend so dispatch/customers
 * can see live tracking. Fails silently in the background — tracking should
 * never block or crash the delivery flow.
 */
export async function reportLocation(tripId: string, location: TrackedLocation): Promise<void> {
  try {
    await api.post(`/trips/${tripId}/location`, location);
  } catch (error) {
    console.warn("[location] failed to report location", error);
  }
}

/**
 * Route/ETA between two points. Tries the backend's routing endpoint first
 * (which should proxy a real directions provider); falls back to a straight-line
 * estimate so the UI still has numbers to show during development.
 */
export async function estimateRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteEstimate> {
  try {
    return await api.post<RouteEstimate>("/routes/estimate", { origin, destination });
  } catch (error) {
    if (__DEV__) {
      const distanceKm = distanceBetweenKm(origin, destination);
      const assumedAvgSpeedKph = 35;
      return { distanceKm, durationMinutes: (distanceKm / assumedAvgSpeedKph) * 60 };
    }
    throw error;
  }
}
