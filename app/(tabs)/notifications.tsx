import React, { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useNotifications } from "@/hooks/useNotifications";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import type { AppNotification } from "@/types/notification";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** Notifications — trip updates and system alerts. */
export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, error, refresh, markRead } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const onPressItem = (item: AppNotification) => {
    if (!item.read) markRead(item.id);
    if (item.relatedTripId) {
      router.push({ pathname: "/trip/[id]", params: { id: item.relatedTripId } });
    }
  };

  if (isLoading && !data) return <LoadingState message="Loading notifications…" />;
  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <View style={styles.flex}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList<AppNotification>
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPressItem(item)}
            style={[styles.item, !item.read && styles.itemUnread]}
            accessibilityRole="button"
          >
            <View style={[styles.iconWrap, item.category === "trips" ? styles.iconTrip : styles.iconSystem]}>
              <Ionicons
                name={item.category === "trips" ? "cube" : "information-circle"}
                size={18}
                color={item.category === "trips" ? colors.primary : colors.info}
              />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemMessage} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={styles.itemTime}>{timeAgo(item.createdAt)}</Text>
            </View>
            {!item.read ? <View style={styles.unreadDot} /> : null}
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState icon="notifications-outline" title="You're all caught up" description="New alerts will show up here." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  item: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.md,
    alignItems: "flex-start",
  },
  itemUnread: {
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconTrip: { backgroundColor: colors.primarySoft },
  iconSystem: { backgroundColor: colors.infoSoft },
  itemBody: { flex: 1, gap: 2 },
  itemTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  itemMessage: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  itemTime: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
});
