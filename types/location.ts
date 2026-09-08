export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface TrackedLocation extends GeoPoint {
  heading?: number | null;
  speedKph?: number | null;
  accuracy?: number | null;
  timestamp: number;
}

export interface RouteEstimate {
  distanceKm: number;
  durationMinutes: number;
  polyline?: GeoPoint[];
}
