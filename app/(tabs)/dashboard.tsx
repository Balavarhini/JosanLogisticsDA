import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useTrips";
import { useDutyStatusToggle } from "@/hooks/useDriverProfile";
import { DriverStatus } from "@/components/DriverStatus";
import { ShipmentCard } from "@/components/ShipmentCard";
import { TripCard } from "@/components/TripCard";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { initialsFromName } from "@utils/format";

/**
 * Dashboard — driver greeting + duty status, the active shipment (if any),
 * today's pickup/delivery/completed stats, and a preview of today's trips.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { driver } = useAuth();
  const { data, isLoading, error, refresh } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const { status, loading: statusLoading, toggle } = useDutyStatusToggle(driver?.dutyStatus ?? "offline", () => {});

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (isLoading && !data) return <LoadingState message="Loading your dashboard…" />;
  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;

  const activeTrip = data?.activeTrip ?? null;
  const todayTrips = data?.todayTrips ?? [];

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top + spacing.sm, spacing.lg) },
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greeting}>Good day, {driver?.name?.split(" ")[0] ?? "Driver"}</Text>
          <Text style={styles.subGreeting}>Here's what's on your route today.</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initialsFromName(driver?.name ?? "D")}</Text>
        </View>
      </View>

      <DriverStatus status={status} onToggle={toggle} loading={statusLoading} />

      {activeTrip ? (
        <ShipmentCard
          trip={activeTrip}
          onViewDetails={() => router.push({ pathname: "/shipment/[id]", params: { id: activeTrip.id } })}
          onNavigate={() => router.push({ pathname: "/tracking/[id]", params: { id: activeTrip.id } })}
        />
      ) : (
        <EmptyState icon="cube-outline" title="No active shipment" description="You're all caught up — new trips will show up here." />
      )}

      <View style={styles.statsGrid}>
        <StatTile label="Pending Pickups" value={data?.pendingPickups ?? 0} />
        <StatTile label="Pending Deliveries" value={data?.pendingDeliveries ?? 0} />
        <StatTile label="Completed Today" value={data?.completedDeliveries ?? 0} />
        <StatTile label="Distance Today" value={`${(data?.distanceTodayKm ?? 0).toFixed(1)} km`} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Trips</Text>
        <Text style={styles.sectionLink} onPress={() => router.push("/(tabs)/trips")}>
          View All
        </Text>
      </View>

      {todayTrips.length === 0 ? (
        <EmptyState icon="calendar-outline" title="No trips scheduled" description="Check back later for new assignments." />
      ) : (
        <View style={styles.tripList}>
          {todayTrips.slice(0, 4).map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
  },
  subGreeting: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
  },
  statTile: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.softBeige,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  statValue: {
    fontSize: typography.metric.fontSize,
    fontWeight: typography.metric.fontWeight,
    color: colors.darkCharcoal,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "700",
    color: colors.primary,
  },
  tripList: {
    gap: spacing.sm + 2,
  },
});
