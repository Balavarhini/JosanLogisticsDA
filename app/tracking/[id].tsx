import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "@/components/MapViewWrapper";
import { colors, spacing, typography } from "@constants/theme";
import { useTrip } from "@/hooks/useTrips";
import { useLiveTracking, useRouteEstimate } from "@/hooks/useLocation";
import { TripStatus } from "@/types/trip";
import { distanceBetweenKm } from "@utils/format";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { NavigationAppModal } from "@/components/NavigationAppModal";
import type { NavDestination } from "@utils/navigation";

const AVG_SPEED_KPH = 35;

/** Live Tracking — continuous GPS updates while driving to the pickup or delivery point. */
export default function LiveTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trip, isLoading, error, refresh, advanceStatus } = useTrip(id);
  const { location, isTracking, error: trackingError, start, stop } = useLiveTracking(id);
  const [arriving, setArriving] = useState(false);
  const [arriveError, setArriveError] = useState<string | null>(null);
  const [showNavModal, setShowNavModal] = useState(false);

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const leg: "pickup" | "delivery" | null =
    trip?.status === TripStatus.GoingToPickup
      ? "pickup"
      : trip?.status === TripStatus.InTransit
      ? "delivery"
      : null;

  const targetAddress = leg === "pickup" ? trip?.pickup : leg === "delivery" ? trip?.delivery : null;
  const destination = targetAddress?.coordinates;

  const navDestination: NavDestination | null = useMemo(() => {
    if (!destination) return null;
    return {
      latitude: destination.latitude,
      longitude: destination.longitude,
      label: targetAddress?.label,
      postalCode: targetAddress?.postalCode,
    };
  }, [destination, targetAddress]);

  const { route } = useRouteEstimate(location, destination);

  const remainingKm = useMemo(() => {
    if (route?.distanceKm != null) return route.distanceKm;
    if (!location || !destination) return null;
    return distanceBetweenKm(location, destination);
  }, [route, location, destination]);

  const etaMinutes = useMemo(() => {
    if (route?.durationMinutes != null) return route.durationMinutes;
    if (remainingKm != null) return Math.max(1, Math.round((remainingKm / AVG_SPEED_KPH) * 60));
    return null;
  }, [route, remainingKm]);

  if (isLoading && !trip) return <LoadingState message="Loading trip…" />;
  if (error && !trip) return <ErrorState message={error} onRetry={refresh} />;
  if (!trip) return null;

  const onArrive = async () => {
    if (!leg) return;
    setArriveError(null);
    setArriving(true);
    try {
      await advanceStatus(leg === "pickup" ? TripStatus.ArrivedAtPickup : TripStatus.ArrivedAtDelivery);
      stop();
      router.back();
    } catch (e) {
      setArriveError(e instanceof Error ? e.message : "Couldn't update your status. Please try again.");
    } finally {
      setArriving(false);
    }
  };

  const polylineCoords =
    route?.polyline && route.polyline.length > 0
      ? route.polyline
      : location && destination
      ? [location, destination]
      : [];

  return (
    <View style={styles.flex}>
      <Header title="Live Tracking" />

      <View style={styles.mapWrap}>
        {location ? (
          <MapView
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker coordinate={location} title="You" pinColor={colors.primary} />
            {destination ? <Marker coordinate={destination} title={leg === "pickup" ? "Pickup" : "Delivery"} /> : null}
            {polylineCoords.length > 0 ? (
              <Polyline coordinates={polylineCoords} strokeColor={colors.primary} strokeWidth={4} />
            ) : null}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>
              {trackingError ?? "Waiting for GPS signal…"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.panel}>
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <Stat label="Heading To" value={leg === "pickup" ? "Pickup" : leg === "delivery" ? "Delivery" : "—"} />
            <Stat label="Distance" value={remainingKm != null ? `${remainingKm.toFixed(1)} km` : "--"} />
            <Stat label="ETA" value={etaMinutes != null ? `${etaMinutes} min` : "--"} />
          </View>
          {location?.speedKph != null ? (
            <Text style={styles.speedText}>Current speed: {Math.max(0, location.speedKph).toFixed(0)} km/h</Text>
          ) : null}
        </Card>

        {arriveError ? <Text style={styles.error}>{arriveError}</Text> : null}

        <View style={styles.actions}>
          {navDestination ? (
            <PrimaryButton
              label="Start Navigation 🧭"
              onPress={() => setShowNavModal(true)}
              style={styles.navButton}
            />
          ) : null}
          <View style={styles.secondaryRow}>
            {isTracking ? (
              <SecondaryButton label="Pause GPS" onPress={stop} style={styles.flex1} />
            ) : (
              <SecondaryButton label="Resume GPS" onPress={start} style={styles.flex1} />
            )}
            <PrimaryButton
              label={leg === "pickup" ? "Arrived Pickup" : "Arrived Delivery"}
              onPress={onArrive}
              disabled={!leg}
              loading={arriving}
              style={styles.flex1}
            />
          </View>
        </View>
      </View>

      <NavigationAppModal
        visible={showNavModal}
        destination={navDestination}
        onClose={() => setShowNavModal(false)}
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  mapWrap: { flex: 1, backgroundColor: colors.border },
  mapPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  mapPlaceholderText: { fontSize: typography.bodySmall.fontSize, color: colors.textSecondary, textAlign: "center" },
  panel: { padding: spacing.lg, gap: spacing.md },
  statsCard: { gap: spacing.sm },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "center", gap: 2 },
  statValue: { fontSize: typography.bodyMedium.fontSize, fontWeight: "700", color: colors.textPrimary },
  statLabel: { fontSize: typography.caption.fontSize, color: colors.textSecondary },
  speedText: { fontSize: typography.caption.fontSize, color: colors.textSecondary, textAlign: "center" },
  actions: { gap: spacing.sm + 2 },
  navButton: { backgroundColor: colors.primaryDark },
  secondaryRow: { flexDirection: "row", gap: spacing.sm },
  flex1: { flex: 1 },
  error: { color: colors.error, fontSize: typography.bodySmall.fontSize, textAlign: "center" },
});
