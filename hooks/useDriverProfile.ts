import { useCallback, useEffect, useState } from "react";
import * as driverService from "@services/driver";
import type { DriverDocument, DriverPerformance, DutyStatus } from "@/types/driver";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useDriverPerformance() {
  const [state, setState] = useState<AsyncState<DriverPerformance>>({ data: null, isLoading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await driverService.getPerformance();
      setState({ data, isLoading: false, error: null });
    } catch (e) {
      setState({ data: null, isLoading: false, error: e instanceof Error ? e.message : "Failed to load performance." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}

export function useDriverDocuments() {
  const [state, setState] = useState<AsyncState<DriverDocument[]>>({ data: null, isLoading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await driverService.getDocuments();
      setState({ data, isLoading: false, error: null });
    } catch (e) {
      setState({ data: null, isLoading: false, error: e instanceof Error ? e.message : "Failed to load documents." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}

/** Optimistic duty-status toggle backed by services/driver.ts. */
export function useDutyStatusToggle(initial: DutyStatus, onChange: (status: DutyStatus) => void) {
  const [status, setStatus] = useState<DutyStatus>(initial);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    const next: DutyStatus = status === "online" ? "offline" : "online";
    setLoading(true);
    setStatus(next);
    try {
      await driverService.setDutyStatus(next);
      onChange(next);
    } catch (e) {
      setStatus(status);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [status, onChange]);

  return { status, loading, toggle };
}
