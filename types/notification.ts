export type NotificationCategory = "trips" | "system";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  relatedTripId?: string;
}
