import { api } from "./api";
import { MOCK_NOTIFICATIONS } from "./mockData";
import type { AppNotification, NotificationCategory } from "@/types/notification";

export async function getNotifications(category: NotificationCategory | "all" = "all"): Promise<AppNotification[]> {
  try {
    return await api.get<AppNotification[]>("/notifications", { category });
  } catch (error) {
    if (__DEV__) {
      return category === "all" ? MOCK_NOTIFICATIONS : MOCK_NOTIFICATIONS.filter((n) => n.category === category);
    }
    throw error;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await api.patch(`/notifications/${id}`, { read: true });
  } catch (error) {
    if (__DEV__) {
      const target = MOCK_NOTIFICATIONS.find((n) => n.id === id);
      if (target) target.read = true;
      return;
    }
    throw error;
  }
}
