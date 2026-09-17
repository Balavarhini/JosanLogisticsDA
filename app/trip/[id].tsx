import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, typography } from "@constants/theme";
import { useTrip } from "@/hooks/useTrips";
import { TripStatus } from "@/types/trip";
import { getTripStatusPresentation } from "@utils/tripStatus";
import { formatDate, formatDistanceKm, formatTime, formatWeightKg } from "@utils/format";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { LocationCard } from "@/components/LocationCard";
import { RouteMapCard } from "@/components/RouteMapCard";
import { TripProgressTracker } from "@/components/TripProgressTracker";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

/** Trip Details — the hub screen for a single trip: progress, addresses, cargo, and the next action. */
export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trip, isLoading, error, refresh, advanceStatus, accept } = useTrip(id);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading && !trip) return <LoadingState message="Loading trip…" />;
  if (error && !trip) return <ErrorState message={error} onRetry={refresh} />;
  if (!trip) return null;

  const presentation = getTripStatusPresentation(trip.status);

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await action();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "That action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const onPrimaryAction = () => {
    switch (trip.status) {
      case TripStatus.Assigned:
        return runAction(accept);
      case TripStatus.Accepted:
        return runAction(async () => {
          await advanceStatus(TripStatus.GoingToPickup);
          router.push({ pathname: "/tracking/[id]", params: { id: trip.id } });
        });
      case TripStatus.GoingToPickup:
        return runAction(() => advanceStatus(TripStatus.ArrivedAtPickup));
      case TripStatus.ArrivedAtPickup:
        return router.push({ pathname: "/pickup/[id]", params: { id: trip.id } });
      case TripStatus.PickupCompleted:
        return runAction(async () => {
          await advanceStatus(TripStatus.InTransit);
          router.push({ pathname: "/tracking/[id]", params: { id: trip.id } });
        });
      case TripStatus.InTransit:
        return runAction(() => advanceStatus(TripStatus.ArrivedAtDelivery));
      case TripStatus.ArrivedAtDelivery:
        return router.push({ pathname: "/delivery/[id]", params: { id: trip.id } });
      default:
        return undefined;
    }
  };

  const showTerminalSummary = trip.status === TripStatus.DeliveryCompleted;

  return (
    <View style={styles.flex}>
      <Header title={`Trip #${trip.reference}`} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.reference}>{trip.shipment.reference}</Text>
              <Text style={styles.window}>
                {formatDate(trip.scheduledWindow.start)} · {formatTime(trip.scheduledWindow.start)} –{" "}
                {formatTime(trip.scheduledWindow.end)}
              </Text>
            </View>
            <StatusBadge status={trip.status} />
          </View>
          <TripProgressTracker status={trip.status} />
        </Card>

        <RouteMapCard pickup={trip.pickup} delivery={trip.delivery} />

        <LocationCard address={trip.pickup} variant="pickup" />
        <LocationCard address={trip.delivery} variant="delivery" />

        <Card style={styles.cargoCard}>
          <Text style={styles.sectionTitle}>Shipment</Text>
          <View style={styles.cargoRow}>
            <Text style={styles.cargoLabel}>Cargo</Text>
            <Text style={styles.cargoValue}>{trip.shipment.cargoDescription}</Text>
          </View>
          <View style={styles.cargoRow}>
            <Text style={styles.cargoLabel}>Packages</Text>
            <Text style={styles.cargoValue}>{trip.shipment.packageCount}</Text>
          </View>
          <View style={styles.cargoRow}>
            <Text style={styles.cargoLabel}>Weight</Text>
            <Text style={styles.cargoValue}>{formatWeightKg(trip.shipment.weightKg)}</Text>
          </View>
          <View style={styles.cargoRow}>
            <Text style={styles.cargoLabel}>Distance</Text>
            <Text style={styles.cargoValue}>{formatDistanceKm(trip.distanceKm)}</Text>
          </View>
        </Card>

        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

        {showTerminalSummary ? (
          <PrimaryButton
            label="View Proof of Delivery"
            onPress={() => router.push({ pathname: "/delivery-confirmation/[id]", params: { id: trip.id } })}
          />
        ) : presentation.nextActionLabel ? (
          <PrimaryButton label={presentation.nextActionLabel} onPress={onPrimaryAction} loading={actionLoading} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  summaryCard: { gap: spacing.md },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  reference: { fontSize: typography.h3.fontSize, fontWeight: typography.h3.fontWeight, color: colors.textPrimary },
  window: { fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: typography.h3.fontSize, fontWeight: typography.h3.fontWeight, color: colors.textPrimary },
  cargoCard: { gap: spacing.sm },
  cargoRow: { flexDirection: "row", justifyContent: "space-between" },
  cargoLabel: { fontSize: typography.bodySmall.fontSize, color: colors.textSecondary },
  cargoValue: { fontSize: typography.bodySmall.fontSize, fontWeight: "600", color: colors.textPrimary },
  error: { color: colors.error, fontSize: typography.bodySmall.fontSize, textAlign: "center" },
});
