/**
 * Offline Sync Manager
 *
 * Temporarily stores status transitions and location updates in local storage
 * when the device loses internet connection. Automatically flushes and syncs
 * queued payloads when network connectivity is restored.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

const OFFLINE_QUEUE_KEY = "@josan_offline_queue_v1";

export interface QueuedAction {
  id: string;
  type: "status_update" | "location_update" | "exception_report";
  endpoint: string;
  payload: any;
  createdAt: string;
}

export async function queueOfflineAction(type: QueuedAction["type"], endpoint: string, payload: any): Promise<void> {
  try {
    const existingStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue: QueuedAction[] = existingStr ? JSON.parse(existingStr) : [];
    
    const action: QueuedAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      endpoint,
      payload,
      createdAt: new Date().toISOString(),
    };

    queue.push(action);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log(`[OfflineSync] Queued action: ${type} -> ${endpoint}`);
  } catch (err) {
    console.error("[OfflineSync] Failed to queue action:", err);
  }
}

export async function flushOfflineQueue(): Promise<number> {
  try {
    const existingStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!existingStr) return 0;

    const queue: QueuedAction[] = JSON.parse(existingStr);
    if (!queue.length) return 0;

    console.log(`[OfflineSync] Flushing ${queue.length} offline actions...`);
    const remaining: QueuedAction[] = [];
    let syncedCount = 0;

    for (const action of queue) {
      try {
        await api.post(action.endpoint, action.payload);
        syncedCount++;
      } catch (err) {
        console.warn(`[OfflineSync] Sync failed for ${action.id}, will retry later:`, err);
        remaining.push(action);
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return syncedCount;
  } catch (err) {
    console.error("[OfflineSync] Error flushing queue:", err);
    return 0;
  }
}

export async function getPendingQueueCount(): Promise<number> {
  try {
    const existingStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!existingStr) return 0;
    const queue: QueuedAction[] = JSON.parse(existingStr);
    return queue.length;
  } catch {
    return 0;
  }
}
