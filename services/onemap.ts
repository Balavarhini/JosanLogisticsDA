/**
 * OneMap Address Search service for the Driver App.
 *
 * All calls are proxied through the backend — OneMap credentials never
 * leave the server. The driver app only needs EXPO_PUBLIC_API_BASE_URL.
 *
 * Usage:
 *   const { results } = await searchOneMapAddress("Changi Airport");
 */
import { api } from "./api";
import type { GeoPoint } from "@/types/location";

export interface OneMapResult {
  buildingName: string;
  address: string;
  postalCode: string;
  blockNumber: string;
  roadName: string;
  latitude: number | null;
  longitude: number | null;
}

export interface AddressSearchResponse {
  found: number;
  totalNum: number;
  pageNum: number;
  results: OneMapResult[];
}

/**
 * Search Singapore addresses via the backend's OneMap proxy.
 * Returns an empty result set (never throws) so the UI degrades gracefully.
 */
export async function searchOneMapAddress(
  query: string,
  page = 1
): Promise<AddressSearchResponse> {
  const empty: AddressSearchResponse = { found: 0, totalNum: 1, pageNum: 1, results: [] };
  if (!query || query.trim().length < 2) return empty;

  try {
    const response = await api.get<AddressSearchResponse>("/map/search", {
      q: query.trim(),
      page,
    });
    return response;
  } catch (error) {
    if (__DEV__) {
      console.log("[onemap] search unavailable, returning empty:", (error as Error).message);
    }
    return empty;
  }
}

/**
 * Creates a debounced version of searchOneMapAddress to observe OneMap's
 * 300 calls/min rate limit during live typing in search bars.
 */
export function createDebouncedSearchOneMap(delayMs = 300) {
  let timer: NodeJS.Timeout | null = null;
  return (query: string, page = 1): Promise<AddressSearchResponse> => {
    return new Promise((resolve) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        const res = await searchOneMapAddress(query, page);
        resolve(res);
      }, delayMs);
    });
  };
}

export interface RouteEstimateResponse {
  distanceKm: number;
  durationMinutes: number;
  polyline: GeoPoint[];
}

/**
 * Get a driving route estimate between two points.
 * Falls back to a straight-line estimate if the backend is unreachable.
 */
export async function estimateOneMapRoute(
  origin: GeoPoint,
  destination: GeoPoint,
  routeType: "drive" | "walk" | "cycle" = "drive"
): Promise<RouteEstimateResponse> {
  try {
    const response = await api.post<RouteEstimateResponse>("/map/route", {
      origin,
      destination,
      routeType,
    });
    return response;
  } catch (error) {
    if (__DEV__) {
      console.log("[onemap] route unavailable, using Haversine fallback:", (error as Error).message);
    }
    // Haversine straight-line fallback
    const R = 6371;
    const dLat = ((destination.latitude - origin.latitude) * Math.PI) / 180;
    const dLng = ((destination.longitude - origin.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((origin.latitude * Math.PI) / 180) *
        Math.cos((destination.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const durationMinutes = Math.ceil((distanceKm / 35) * 60);
    return { distanceKm, durationMinutes, polyline: [] };
  }
}

/**
 * Reverse geocode a lat/lng to a Singapore address string.
 * Returns null if the API is unavailable.
 */
export async function reverseGeocodePoint(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const result = await api.get<{
      buildingName: string;
      address: string;
      blockNumber: string;
      postalCode: string;
    }>("/map/reverse", { lat: latitude, lng: longitude });

    const parts = [result.buildingName, result.blockNumber, result.address, result.postalCode]
      .filter(Boolean)
      .join(", ");
    return parts || null;
  } catch {
    return null;
  }
}
