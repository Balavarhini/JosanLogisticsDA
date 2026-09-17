/**
 * App-wide runtime configuration, sourced from environment variables.
 * Expo only inlines variables prefixed with EXPO_PUBLIC_ into the JS bundle.
 * See .env.example for the full list and services/api.ts for how this is consumed.
 */

export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.josanlogistics.com/v1",
  apiTimeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 15000),
  apiDebug: process.env.EXPO_PUBLIC_API_DEBUG === "true",
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
} as const;

export const STORAGE_KEYS = {
  authToken: "josan.auth.token",
  refreshToken: "josan.auth.refreshToken",
  driverProfile: "josan.auth.driverProfile",
} as const;
