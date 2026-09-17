import { api } from "./api";
import { MOCK_PERFORMANCE, MOCK_DOCUMENTS } from "./mockData";
import type { DutyStatus, DriverPerformance, DriverDocument } from "@/types/driver";

export async function setDutyStatus(status: DutyStatus | 'online' | 'offline' | 'on_break'): Promise<any> {
  try {
    const res = await api.patch<{ success: boolean; data: { status: string } }>("/driver/status", { status });
    return res.data;
  } catch (error) {
    if (__DEV__) return { status };
    throw error;
  }
}

export async function getEarnings(): Promise<{ todayEarnings: number; weekEarnings: number; monthEarnings: number; recentEarnings: any[] }> {
  try {
    const res = await api.get<{ success: boolean; data: any }>("/driver/earnings");
    return res.data;
  } catch (error) {
    return {
      todayEarnings: 125.0,
      weekEarnings: 680.0,
      monthEarnings: 2450.0,
      recentEarnings: [
        { id: "e1", amount: 45.0, description: "Trip TRIP-2026-001 fare", earned_at: new Date().toISOString() },
        { id: "e2", amount: 80.0, description: "Trip TRIP-2026-002 fare", earned_at: new Date().toISOString() },
      ],
    };
  }
}

export async function getVehicle(): Promise<any> {
  try {
    const res = await api.get<{ success: boolean; data: any }>("/driver/vehicle");
    return res.data;
  } catch (error) {
    return {
      vehiclePlate: "GBB 8888 X",
      vehicleType: "Toyota HiAce (1000kg)",
      capacityKg: 1000,
      odometerKm: 45200,
      insuranceExpiry: "2027-04-30",
      inspectionExpiry: "2027-01-15",
      status: "operational",
    };
  }
}

export async function getSchedule(): Promise<any[]> {
  try {
    const res = await api.get<{ success: boolean; data: any[] }>("/driver/schedule");
    return res.data || [];
  } catch (error) {
    return [
      { id: "s1", reference: "TRIP-2026-001", pickup_label: "Changi Logistics Hub", delivery_label: "Marina Bay Sands", scheduled_start: new Date().toISOString(), status: "assigned" },
    ];
  }
}

export async function getPerformance(): Promise<DriverPerformance> {
  try {
    return await api.get<DriverPerformance>("/drivers/me/performance");
  } catch (error) {
    return MOCK_PERFORMANCE;
  }
}

export async function getDocuments(): Promise<DriverDocument[]> {
  try {
    return await api.get<DriverDocument[]>("/drivers/me/documents");
  } catch (error) {
    return MOCK_DOCUMENTS;
  }
}
