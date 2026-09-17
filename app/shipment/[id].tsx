import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, typography } from "@constants/theme";
import { useTrip } from "@/hooks/useTrips";
import { TripStatus } from "@/types/trip";
import { formatDistanceKm, formatTime, formatWeightKg } from "@utils/format";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { LocationCard } from "@/components/LocationCard";
import { RouteMapCard } from "@/components/RouteMapCard";
import { TripProgressTracker } from "@/components/TripProgressTracker";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

/** Active Shipment — focused view of the trip currently in progress, with quick actions. */
export default function ActiveShipmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trip, isLoading, error, refresh } = useTrip(id);

  if (isLoading && !trip) return <LoadingState message="Loading active shipment…" />;
  if (error && !trip) return <ErrorState message={error} onRetry={refresh} />;
  if (!trip) return null;

  const isTerminal = trip.status === TripStatus.DeliveryCompleted || trip.status === TripStatus.Cancelled || trip.status === TripStatus.Failed;
  const canGoToDelivery = trip.status === TripStatus.ArrivedAtDelivery;

  return (
    <View style={styles.flex}>
      <Header title="Active Shipment" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.eyebrow}>SHIPMENT {trip.shipment.reference}</Text>
          <View style={styles.row}>
            <Text style={styles.reference}>TRIP #{trip.reference}</Text>
            <StatusBadge status={trip.status} />
          </View>
          <TripProgressTracker status={trip.status} />
        </Card>

        <View style={styles.metaRow}>
          <MetaTile label="ETA" value={formatTime(trip.estimatedArrival)} />
          <MetaTile label="Distance" value={formatDistanceKm(trip.distanceKm)} />
          <MetaTile label="Weight" value={formatWeightKg(trip.shipment.weightKg)} />
        </View>

        <RouteMapCard pickup={trip.pickup} delivery={trip.delivery} />

        <LocationCard address={trip.pickup} variant="pickup" />
        <LocationCard address={trip.delivery} variant="delivery" />

        {isTerminal ? (
          <EmptyState icon="checkmark-done-circle-outline" title="This shipment is complete" description="No further action is needed." />
        ) : (
          <View style={styles.actions}>
            <PrimaryButton
              label="Live Tracking"
              onPress={() => router.push({ pathname: "/tracking/[id]", params: { id: trip.id } })}
            />
            {canGoToDelivery ? (
              <PrimaryButton
                label="Proof of Delivery"
                onPress={() => router.push({ pathname: "/pod/[id]", params: { id: trip.id } })}
                variant="secondary"
              />
            ) : null}
            <SecondaryButton
              label="View Full Trip Details"
              onPress={() => router.push({ pathname: "/trip/[id]", params: { id: trip.id } })}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaTile}>
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: { gap: spacing.md },
  eyebrow: { fontSize: typography.caption.fontSize, fontWeight: "700", color: colors.primary, letterSpacing: 0.5 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reference: { fontSize: typography.h3.fontSize, fontWeight: typography.h3.fontWeight, color: colors.textPrimary },
  metaRow: { flexDirection: "row", gap: spacing.sm + 2 },
  metaTile: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: spacing.md, gap: 2, alignItems: "center" },
  metaValue: { fontSize: typography.bodyMedium.fontSize, fontWeight: "700", color: colors.textPrimary },
  metaLabel: { fontSize: typography.caption.fontSize, color: colors.textSecondary },
  actions: { gap: spacing.sm + 2 },
});
