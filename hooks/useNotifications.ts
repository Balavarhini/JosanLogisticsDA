import { useCallback, useEffect, useState } from "react";
import * as notificationsService from "@services/notifications";
import type { AppNotification, NotificationCategory } from "@/types/notification";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useNotifications(category: NotificationCategory | "all" = "all") {
  const [state, setState] = useState<AsyncState<AppNotification[]>>({ data: null, isLoading: true, error: null });

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsService.getNotifications(category);
      setState({ data, isLoading: false, error: null });
    } catch (e) {
      setState({
        data: null,
        isLoading: false,
        error: e instanceof Error ? e.message : "Failed to load notifications.",
      });
    }
  }, [category]);

  const refresh = useCallback(() => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    let active = true;
    notificationsService.getNotifications(category).then(
      (data) => {
        if (active) setState({ data, isLoading: false, error: null });
      },
      (e) => {
        if (active) {
          setState({
            data: null,
            isLoading: false,
            error: e instanceof Error ? e.message : "Failed to load notifications.",
          });
        }
      }
    );
    return () => {
      active = false;
    };
  }, [category]);

  const markRead = useCallback(async (id: string) => {
    setState((s) => (s.data ? { ...s, data: s.data.map((n) => (n.id === id ? { ...n, read: true } : n)) } : s));
    try {
      await notificationsService.markNotificationRead(id);
    } catch {
      // Optimistic update stands even if the backend call fails silently;
      // a pull-to-refresh will reconcile the true state.
    }
  }, []);

  return { ...state, refresh, markRead };
}
