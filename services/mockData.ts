/**
 * Local sample data used ONLY as a fallback so the app is browsable before a
 * real backend is wired up (see services/trips.ts). Every function in that
 * file tries the real API first — this module is never imported by any
 * screen directly. Safe (and expected) to delete once EXPO_PUBLIC_API_BASE_URL
 * points at a live backend.
 */
import { Trip, TripStatus } from "@/types/trip";
import { AppNotification } from "@/types/notification";
import { DriverPerformance, DriverDocument } from "@/types/driver";

export const MOCK_TRIPS: Trip[] = [
  {
    id: "trp-1024",
    reference: "TRP-1024",
    status: TripStatus.InTransit,
    vehiclePlate: "SG-8819",
    scheduledWindow: { start: "2026-09-07T08:30:00+08:00", end: "2026-09-07T16:30:00+08:00" },
    pickup: {
      label: "Pickup",
      line1: "Changi Air Cargo Complex",
      city: "Singapore",
      coordinates: { latitude: 1.3644, longitude: 103.9915 },
      contactName: "Cargo Desk",
      contactPhone: "+65 6541 2200",
    },
    delivery: {
      label: "Delivery",
      line1: "Jurong Port Industrial Estate",
      city: "Singapore",
      coordinates: { latitude: 1.3006, longitude: 103.7116 },
      contactName: "Razer Asia-Pacific HQ",
      contactPhone: "+65 6011 2233",
    },
    shipment: {
      id: "ship-88190",
      reference: "JOS-88190-SG",
      cargoDescription: "High-Tech Electronics & Microchips",
      weightKg: 245.5,
      packageCount: 12,
    },
    distanceKm: 18.4,
    estimatedArrival: "2026-09-07T16:30:00+08:00",
    createdAt: "2026-09-07T06:00:00+08:00",
    updatedAt: "2026-09-07T10:00:00+08:00",
  },
  {
    id: "trp-1031",
    reference: "TRP-1031",
    status: TripStatus.Assigned,
    vehiclePlate: "SG-8819",
    scheduledWindow: { start: "2026-09-08T09:00:00+08:00", end: "2026-09-08T13:00:00+08:00" },
    pickup: {
      label: "Pickup",
      line1: "Tuas Distribution Hub",
      city: "Singapore",
      coordinates: { latitude: 1.3212, longitude: 103.6377 },
    },
    delivery: {
      label: "Delivery",
      line1: "Orchard Central Mall, Loading Bay 3",
      city: "Singapore",
      coordinates: { latitude: 1.3011, longitude: 103.8398 },
      contactName: "Orchard Central Retail Mgmt",
      contactPhone: "+65 6222 9981",
    },
    shipment: {
      id: "ship-88231",
      reference: "JOS-88231-SG",
      cargoDescription: "Retail Apparel Pallets",
      weightKg: 310,
      packageCount: 20,
    },
    distanceKm: 24.1,
    createdAt: "2026-09-07T09:00:00+08:00",
    updatedAt: "2026-09-07T09:00:00+08:00",
  },
  {
    id: "trp-1009",
    reference: "TRP-1009",
    status: TripStatus.DeliveryCompleted,
    vehiclePlate: "SG-8819",
    scheduledWindow: { start: "2026-09-06T10:00:00+08:00", end: "2026-09-06T14:00:00+08:00" },
    pickup: { label: "Pickup", line1: "Depot Center East", city: "Singapore" },
    delivery: {
      label: "Delivery",
      line1: "390 Ocean Parkway",
      city: "Singapore",
      contactName: "Ocean Parkway Residences",
      contactPhone: "+65 6555 4410",
    },
    shipment: {
      id: "ship-88120",
      reference: "JOS-88120-SG",
      cargoDescription: "Home Appliances",
      weightKg: 180,
      packageCount: 6,
    },
    distanceKm: 12.2,
    pod: {
      otpVerified: true,
      deliveredAt: "2026-09-06T14:18:00+08:00",
    },
    createdAt: "2026-09-06T08:00:00+08:00",
    updatedAt: "2026-09-06T14:18:00+08:00",
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    category: "trips",
    title: "New delivery assigned",
    body: "Shipment JOS-88231-SG has been assigned to you.",
    createdAt: "2026-09-07T09:00:00+08:00",
    read: false,
    relatedTripId: "trp-1031",
  },
  {
    id: "notif-2",
    category: "trips",
    title: "Route updated",
    body: "Your delivery route for TRP-1024 has been updated by Dispatch.",
    createdAt: "2026-09-07T09:40:00+08:00",
    read: false,
    relatedTripId: "trp-1024",
  },
  {
    id: "notif-3",
    category: "system",
    title: "Delivery completed",
    body: "Shipment JOS-88120-SG was successfully delivered.",
    createdAt: "2026-09-06T14:18:00+08:00",
    read: true,
    relatedTripId: "trp-1009",
  },
];

export const MOCK_PERFORMANCE: DriverPerformance = {
  overallScore: 96,
  rating: 4.9,
  onTimeDeliveryPct: 99.6,
  successfulDeliveryPct: 98.8,
  safetyScorePct: 100,
};

export const MOCK_DOCUMENTS: DriverDocument[] = [
  { id: "doc-1", title: "Commercial Driving License", type: "license", status: "valid", expiresAt: "2027-04-12" },
  { id: "doc-2", title: "Vehicle Insurance", type: "insurance", status: "expiring_soon", expiresAt: "2026-10-01" },
  { id: "doc-3", title: "Vehicle Registration", type: "vehicle_registration", status: "valid", expiresAt: "2027-01-20" },
  { id: "doc-4", title: "Driver ID Card", type: "id_card", status: "valid" },
];
