export function formatTime(iso: string | undefined): string {
  if (!iso) return "--:--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDistanceKm(km: number | undefined): string {
  if (km === undefined) return "--";
  return `${km.toFixed(1)} km`;
}

export function formatWeightKg(kg: number | undefined): string {
  if (kg === undefined) return "--";
  return `${kg.toFixed(1)} kg`;
}

export function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/** Haversine distance in kilometers between two coordinates. */
export function distanceBetweenKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}
