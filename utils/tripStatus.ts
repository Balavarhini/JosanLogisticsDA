import { colors } from "@constants/theme";
import { TripStatus, TRIP_STATUS_FLOW } from "@/types";

export interface TripStatusPresentation {
  label: string;
  color: string;
  softColor: string;
  /** Label for the primary action button shown for this status, if any. */
  nextActionLabel?: string;
}

const PRESENTATION: Record<TripStatus, TripStatusPresentation> = {
  [TripStatus.Assigned]: { label: "Assigned", color: colors.warning, softColor: colors.warningSoft, nextActionLabel: "Accept Trip" },
  [TripStatus.Accepted]: { label: "Accepted", color: colors.info, softColor: colors.infoSoft, nextActionLabel: "Go to Pickup" },
  [TripStatus.GoingToPickup]: { label: "Going to Pickup", color: colors.primary, softColor: colors.primarySoft, nextActionLabel: "Mark Arrived" },
  [TripStatus.ArrivedAtPickup]: { label: "Arrived at Pickup", color: colors.info, softColor: colors.infoSoft, nextActionLabel: "Complete Pickup" },
  [TripStatus.PickupCompleted]: { label: "Pickup Completed", color: colors.primary, softColor: colors.primarySoft, nextActionLabel: "Start Transit" },
  [TripStatus.InTransit]: { label: "In Transit", color: colors.primary, softColor: colors.primarySoft, nextActionLabel: "Mark Arrived" },
  [TripStatus.ArrivedAtDelivery]: { label: "Arrived at Delivery", color: colors.info, softColor: colors.infoSoft, nextActionLabel: "Start Delivery" },
  [TripStatus.DeliveryCompleted]: { label: "Delivered", color: colors.success, softColor: colors.successSoft },
  [TripStatus.Cancelled]: { label: "Cancelled", color: colors.textSecondary, softColor: colors.neutralSoft },
  [TripStatus.Failed]: { label: "Failed", color: colors.error, softColor: colors.errorSoft },
};

export function getTripStatusPresentation(status: TripStatus): TripStatusPresentation {
  return PRESENTATION[status];
}

/** Returns the next status in the standard flow, or null if terminal / not in flow. */
export function getNextTripStatus(status: TripStatus): TripStatus | null {
  const index = TRIP_STATUS_FLOW.indexOf(status);
  if (index === -1 || index === TRIP_STATUS_FLOW.length - 1) return null;
  return TRIP_STATUS_FLOW[index + 1];
}

/** Index of a status within the ordered flow, for progress-tracker rendering. Terminal
 * statuses (cancelled/failed) return -1 and should be rendered as an alert state instead. */
export function getTripStatusStepIndex(status: TripStatus): number {
  return TRIP_STATUS_FLOW.indexOf(status);
}
