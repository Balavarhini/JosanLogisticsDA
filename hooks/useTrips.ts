import { useCallback, useEffect, useState } from "react";
import * as tripsService from "@services/trips";
import type { DashboardSummary } from "@/types/dashboard";
import type { ProofOfDelivery, Trip, TripListFilter, TripStatus } from "@/types/trip";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useDashboard() {
  const [state, setState] = useState<AsyncState<DashboardSummary>>({ data: null, isLoading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await tripsService.getDashboardSummary();
      setState({ data, isLoading: false, error: null });
    } catch (e) {
      setState({ data: null, isLoading: false, error: e instanceof Error ? e.message : "Failed to load dashboard." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}

export function useTripList(filter: TripListFilter) {
  const [state, setState] = useState<AsyncState<Trip[]>>({ data: null, isLoading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await tripsService.getTrips(filter);
      setState({ data, isLoading: false, error: null });
    } catch (e) {
      setState({ data: null, isLoading: false, error: e instanceof Error ? e.message : "Failed to load trips." });
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}

export function useTrip(id: string | undefined) {
  const [state, setState] = useState<AsyncState<Trip>>({ data: null, isLoading: true, error: null });

  const load = useCallback(async () => {
    if (!id) return;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await tripsService.getTripById(id);
      setState({ data, isLoading: false, error: null });
    } catch (e) {
      setState({ data: null, isLoading: false, error: e instanceof Error ? e.message : "Failed to load trip." });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const advanceStatus = useCallback(
    async (nextStatus: TripStatus) => {
      if (!id) return;
      const updated = await tripsService.advanceTripStatus(id, nextStatus);
      setState((s) => ({ ...s, data: updated }));
      return updated;
    },
    [id]
  );

  const accept = useCallback(async () => {
    if (!id) return;
    const updated = await tripsService.acceptTrip(id);
    setState((s) => ({ ...s, data: updated }));
    return updated;
  }, [id]);

  const submitPod = useCallback(
    async (pod: ProofOfDelivery) => {
      if (!id) return;
      const updated = await tripsService.submitProofOfDelivery(id, pod);
      setState((s) => ({ ...s, data: updated }));
      return updated;
    },
    [id]
  );

  return { ...state, refresh: load, advanceStatus, accept, submitPod };
}
