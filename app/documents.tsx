import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useDriverDocuments } from "@/hooks/useDriverProfile";
import { formatDate } from "@utils/format";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import type { DriverDocument } from "@/types/driver";

const TYPE_ICON: Record<DriverDocument["type"], keyof typeof Ionicons.glyphMap> = {
  license: "card-outline",
  insurance: "shield-checkmark-outline",
  vehicle_registration: "document-text-outline",
  id_card: "id-card-outline",
  other: "folder-outline",
};

const STATUS_STYLE: Record<DriverDocument["status"], { label: string; color: string; soft: string }> = {
  valid: { label: "Valid", color: colors.success, soft: colors.successSoft },
  expiring_soon: { label: "Expiring Soon", color: colors.warning, soft: colors.warningSoft },
  expired: { label: "Expired", color: colors.error, soft: colors.errorSoft },
  pending_review: { label: "Pending Review", color: colors.info, soft: colors.infoSoft },
};

/** Documents — the driver's license, insurance, registration and ID on file. */
export default function DocumentsScreen() {
  const { data, isLoading, error, refresh } = useDriverDocuments();

  return (
    <View style={styles.flex}>
      <Header title="Documents" />
      {isLoading && !data ? (
        <LoadingState message="Loading documents…" />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList<DriverDocument>
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm + 2 }} />}
          renderItem={({ item }) => {
            const statusStyle = STATUS_STYLE[item.status];
            return (
              <Card style={styles.card}>
                <View style={styles.iconWrap}>
                  <Ionicons name={TYPE_ICON[item.type]} size={20} color={colors.textPrimary} />
                </View>
                <View style={styles.body}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.expiresAt ? <Text style={styles.expiry}>Expires {formatDate(item.expiresAt)}</Text> : null}
                </View>
                <View style={[styles.badge, { backgroundColor: statusStyle.soft }]}>
                  <Text style={[styles.badgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={
            <EmptyState icon="folder-open-outline" title="No documents on file" description="Your uploaded documents will appear here." />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, flexGrow: 1 },
  card: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.button,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: typography.bodyMedium.fontSize, fontWeight: "700", color: colors.textPrimary },
  expiry: { fontSize: typography.caption.fontSize, color: colors.textSecondary },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: typography.caption.fontSize, fontWeight: "700" },
});
