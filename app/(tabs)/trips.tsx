import React, { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useTripList } from "@/hooks/useTrips";
import { TripCard } from "@/components/TripCard";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import type { Trip, TripListFilter } from "@/types/trip";

const FILTERS: { key: TripListFilter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

/** My Trips — filterable list of the driver's trips. */
export default function TripsScreen() {
  const [filter, setFilter] = useState<TripListFilter>("today");
  const { data, isLoading, error, refresh } = useTripList(filter);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <View style={styles.flex}>
      <Text style={styles.title}>My Trips</Text>

      <View style={styles.tabs}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading && !data ? (
        <LoadingState message="Loading trips…" />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList<Trip>
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => <TripCard trip={item} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm + 2 }} />}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No trips here"
              description={`You have no ${filter} trips right now.`}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  tabs: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
});
