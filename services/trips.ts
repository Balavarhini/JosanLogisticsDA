/**
 * All trip/shipment data access goes through this file — screens never call
 * the API client directly. Every function tries the real backend first; if
 * it's unreachable (no backend configured yet) it falls back to local sample
 * data in __DEV__ only, so the app is fully browsable out of the box. Delete
 * the fallback branches once EXPO_PUBLIC_API_BASE_URL points at a live API.
 */
import { api } from "./api";
import { MOCK_TRIPS } from "./mockData";
import type { Trip, TripListFilter, TripStatus, ProofOfDelivery, FailedDeliveryReport } from "@/types/trip";
import type { DashboardSummary } from "@/types/dashboard";

async function withDevFallback<T>(request: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (__DEV__) {
      console.warn("[trips] API unavailable, using local sample data:", (error as Error).message);
      return fallback();
    }
    throw error;
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return withDevFallback(
    () => api.get<DashboardSummary>("/dashboard/summary"),
    () => {
      const activeTrip = MOCK_TRIPS.find((t) => t.status === "in_transit") ?? null;
      const todayTrips = MOCK_TRIPS.filter((t) => t.status !== "delivery_completed");
      return {
        activeTrip,
        todayTrips,
        pendingPickups: MOCK_TRIPS.filter((t) => t.status === "assigned" || t.status === "accepted").length,
        pendingDeliveries: MOCK_TRIPS.filter((t) => t.status === "in_transit" || t.status === "arrived_at_delivery").length,
        completedDeliveries: MOCK_TRIPS.filter((t) => t.status === "delivery_completed").length,
        distanceTodayKm: 126,
      };
    }
  );
}

export async function getTrips(filter: TripListFilter): Promise<Trip[]> {
  return withDevFallback(
    () => api.get<Trip[]>("/trips", { filter }),
    () => {
      if (filter === "completed") return MOCK_TRIPS.filter((t) => t.status === "delivery_completed");
      if (filter === "upcoming") return MOCK_TRIPS.filter((t) => t.status === "assigned");
      return MOCK_TRIPS.filter((t) => t.status !== "delivery_completed" && t.status !== "assigned");
    }
  );
}

export async function getTripById(id: string): Promise<Trip> {
  return withDevFallback(
    () => api.get<Trip>(`/trips/${id}`),
    () => {
      const trip = MOCK_TRIPS.find((t) => t.id === id);
      if (!trip) throw new Error(`Trip ${id} not found`);
      return trip;
    }
  );
}

export async function acceptTrip(id: string): Promise<Trip> {
  return withDevFallback(
    () => api.post<Trip>(`/trips/${id}/accept`),
    () => {
      const trip = MOCK_TRIPS.find((t) => t.id === id) ?? MOCK_TRIPS[0];
      return { ...trip, status: "accepted" as TripStatus };
    }
  );
}

export async function rejectTrip(id: string, reason: string, notes?: string): Promise<void> {
  return withDevFallback(
    () => api.post(`/trips/${id}/reject`, { reason, notes }),
    () => {
      const trip = MOCK_TRIPS.find((t) => t.id === id);
      if (trip) trip.status = "assigned" as TripStatus;
    }
  );
}

export async function advanceTripStatus(id: string, nextStatus: TripStatus): Promise<Trip> {
  return withDevFallback(
    () => api.patch<Trip>(`/trips/${id}/status`, { status: nextStatus }),
    () => {
      const trip = MOCK_TRIPS.find((t) => t.id === id) ?? MOCK_TRIPS[0];
      trip.status = nextStatus;
      return { ...trip, status: nextStatus };
    }
  );
}

export async function submitProofOfDelivery(id: string, pod: ProofOfDelivery): Promise<Trip> {
  return withDevFallback(
    async () => {
      const formData = new FormData();
      if (pod.photoUri) {
        formData.append("photo", { uri: pod.photoUri, name: "pod-photo.jpg", type: "image/jpeg" } as unknown as Blob);
      }
      if (pod.signatureUri) {
        formData.append("signature", { uri: pod.signatureUri, name: "signature.png", type: "image/png" } as unknown as Blob);
      }
      formData.append("otpVerified", String(pod.otpVerified));
      if (pod.remarks) formData.append("remarks", pod.remarks);
      if (pod.deliveredLocation) formData.append("location", JSON.stringify(pod.deliveredLocation));

      return api.upload<Trip>(`/trips/${id}/proof-of-delivery`, formData);
    },
    () => {
      const trip = MOCK_TRIPS.find((t) => t.id === id) ?? MOCK_TRIPS[0];
      trip.status = "delivery_completed" as TripStatus;
      return { ...trip, status: "delivery_completed" as TripStatus };
    }
  );
}

export async function reportFailedDelivery(report: FailedDeliveryReport): Promise<void> {
  return withDevFallback(
    async () => {
      const formData = new FormData();
      formData.append("reason", report.reason);
      if (report.notes) formData.append("notes", report.notes);
      if (report.photoUri) {
        formData.append("photo", { uri: report.photoUri, name: "evidence.jpg", type: "image/jpeg" } as unknown as Blob);
      }
      await api.upload(`/trips/${report.tripId}/failed-delivery`, formData);
    },
    () => {
      const trip = MOCK_TRIPS.find((t) => t.id === report.tripId) ?? MOCK_TRIPS[0];
      trip.status = "failed" as TripStatus;
    }
  );
}
