import type { GeoPoint } from "./location";

/**
 * The full trip lifecycle, in order. UI states (badges, progress trackers,
 * available actions) are derived from this single source of truth — see
 * utils/tripStatus.ts for the presentation mapping.
 */
export enum TripStatus {
  Assigned = "assigned",
  Accepted = "accepted",
  GoingToPickup = "going_to_pickup",
  ArrivedAtPickup = "arrived_at_pickup",
  PickupCompleted = "pickup_completed",
  InTransit = "in_transit",
  ArrivedAtDelivery = "arrived_at_delivery",
  DeliveryCompleted = "delivery_completed",
  Cancelled = "cancelled",
  Failed = "failed",
}

/** Ordered list used to render progress trackers. Terminal states are excluded. */
export const TRIP_STATUS_FLOW: TripStatus[] = [
  TripStatus.Assigned,
  TripStatus.Accepted,
  TripStatus.GoingToPickup,
  TripStatus.ArrivedAtPickup,
  TripStatus.PickupCompleted,
  TripStatus.InTransit,
  TripStatus.ArrivedAtDelivery,
  TripStatus.DeliveryCompleted,
];

export interface Address {
  label: string;
  line1: string;
  line2?: string;
  city?: string;
  coordinates?: GeoPoint;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}

export interface ShipmentItem {
  id: string;
  description: string;
  quantity: number;
  weightKg?: number;
}

export interface Shipment {
  id: string;
  reference: string;
  cargoDescription: string;
  weightKg: number;
  packageCount: number;
  items?: ShipmentItem[];
}

export interface ProofOfDelivery {
  signatureUri?: string;
  photoUri?: string;
  otpVerified: boolean;
  remarks?: string;
  deliveredAt?: string;
  deliveredLocation?: GeoPoint;
}

export interface Trip {
  id: string;
  reference: string;
  status: TripStatus;
  vehiclePlate?: string;
  scheduledWindow: { start: string; end: string };
  pickup: Address;
  delivery: Address;
  shipment: Shipment;
  distanceKm?: number;
  estimatedArrival?: string;
  pod?: ProofOfDelivery;
  createdAt: string;
  updatedAt: string;
}

export type TripListFilter = "today" | "upcoming" | "completed";

export interface FailedDeliveryReport {
  tripId: string;
  reason:
    | "customer_unavailable"
    | "wrong_address"
    | "customer_refused"
    | "damaged_shipment"
    | "access_restricted"
    | "other";
  notes?: string;
  photoUri?: string;
}
