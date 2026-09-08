import { api } from "./api";
import { MOCK_PERFORMANCE, MOCK_DOCUMENTS } from "./mockData";
import type { DutyStatus, DriverPerformance, DriverDocument } from "@/types/driver";

export async function setDutyStatus(status: DutyStatus): Promise<void> {
  await api.patch("/drivers/me/duty-status", { status });
}

export async function getPerformance(): Promise<DriverPerformance> {
  try {
    return await api.get<DriverPerformance>("/drivers/me/performance");
  } catch (error) {
    if (__DEV__) return MOCK_PERFORMANCE;
    throw error;
  }
}

export async function getDocuments(): Promise<DriverDocument[]> {
  try {
    return await api.get<DriverDocument[]>("/drivers/me/documents");
  } catch (error) {
    if (__DEV__) return MOCK_DOCUMENTS;
    throw error;
  }
}
