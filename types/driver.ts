export type DutyStatus = "online" | "offline";

export interface Driver {
  id: string;
  employeeId: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  email: string;
  hub: string;
  dutyStatus: DutyStatus;
  rating?: number;
  vehiclePlate?: string;
}

export interface DriverPerformance {
  overallScore: number;
  rating: number;
  onTimeDeliveryPct: number;
  successfulDeliveryPct: number;
  safetyScorePct: number;
}

export interface DriverDocument {
  id: string;
  title: string;
  type: "license" | "insurance" | "vehicle_registration" | "id_card" | "other";
  status: "valid" | "expiring_soon" | "expired" | "pending_review";
  expiresAt?: string;
  fileUri?: string;
}
