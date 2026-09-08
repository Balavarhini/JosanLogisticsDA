import type { Trip } from "./trip";

export interface DashboardSummary {
  activeTrip: Trip | null;
  todayTrips: Trip[];
  pendingPickups: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  distanceTodayKm: number;
}
