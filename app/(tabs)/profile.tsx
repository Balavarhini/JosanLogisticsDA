import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useDriverPerformance } from "@/hooks/useDriverProfile";
import { Card } from "@/components/Card";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { initialsFromName } from "@utils/format";

import { SosModal } from "@/components/SosModal";

const MENU_ITEMS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { key: "earnings", label: "My Earnings & Payouts", icon: "wallet-outline", route: "/earnings" },
  { key: "vehicle", label: "Assigned Vehicle", icon: "car-outline", route: "/vehicle" },
  { key: "schedule", label: "Shift Schedule", icon: "calendar-outline", route: "/schedule" },
  { key: "documents", label: "Documents", icon: "document-text-outline", route: "/documents" },
  { key: "settings", label: "Settings", icon: "settings-outline", route: "/settings" },
  { key: "help", label: "Help & Support", icon: "help-circle-outline", route: "/help" },
];

/** Driver Profile — identity, performance summary, and account actions. */
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { driver, logout } = useAuth();
  const { data: performance } = useDriverPerformance();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top + spacing.sm, spacing.lg) },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initialsFromName(driver?.name ?? "Driver")}</Text>
        </View>
        <Text style={styles.name}>{driver?.name ?? "Driver"}</Text>
        <Text style={styles.subtext}>
          {driver?.employeeId ?? "--"} · {driver?.hub ?? "Unassigned Hub"}
        </Text>
      </View>

      <Card style={styles.infoCard}>
        <InfoRow icon="call-outline" label="Phone" value={driver?.phone ?? "--"} />
        <InfoRow icon="mail-outline" label="Email" value={driver?.email ?? "--"} />
        <InfoRow icon="car-outline" label="Vehicle" value={driver?.vehiclePlate ?? "Not assigned"} />
      </Card>

      {performance ? (
        <Card style={styles.performanceCard}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.statsRow}>
            <Stat label="Rating" value={performance.rating.toFixed(1)} />
            <Stat label="On-Time" value={`${performance.onTimeDeliveryPct}%`} />
            <Stat label="Success" value={`${performance.successfulDeliveryPct}%`} />
            <Stat label="Safety" value={`${performance.safetyScorePct}%`} />
          </View>
        </Card>
      ) : null}

      <Card style={styles.menuCard}>
        {MENU_ITEMS.map((item, index) => (
          <View key={item.key}>
            <Pressable
              style={styles.menuRow}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => router.push(item.route as never)}
            >
              <Ionicons name={item.icon} size={20} color={colors.textPrimary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
            {index < MENU_ITEMS.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </Card>

      <Pressable
        style={styles.sosRow}
        accessibilityRole="button"
        accessibilityLabel="Emergency SOS"
        onPress={() => setShowSosModal(true)}
      >
        <Ionicons name="alert-circle" size={20} color={colors.error} />
        <Text style={styles.sosLabel}>🚨 Emergency SOS Alert</Text>
      </Pressable>

      <Pressable
        style={styles.logoutRow}
        accessibilityRole="button"
        accessibilityLabel="Log out"
        onPress={() => setConfirmingLogout(true)}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutLabel}>Log Out</Text>
      </Pressable>

      <SosModal visible={showSosModal} onClose={() => setShowSosModal(false)} />

      <ConfirmationModal
        visible={confirmingLogout}
        title="Log out?"
        message="You'll need to sign in again to view your trips."
        confirmLabel="Log Out"
        destructive
        onConfirm={async () => {
          setConfirmingLogout(false);
          await logout();
        }}
        onCancel={() => setConfirmingLogout(false)}
      />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
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
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { alignItems: "center", gap: 4, marginBottom: spacing.sm },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  avatarText: {
    fontSize: typography.h2.fontSize,
    fontWeight: "700",
    color: colors.primary,
  },
  name: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.textPrimary,
  },
  subtext: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  infoCard: { gap: spacing.sm + 2 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  infoLabel: { fontSize: typography.bodySmall.fontSize, color: colors.textSecondary, width: 60 },
  infoValue: { flex: 1, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary, fontWeight: "600", textAlign: "right" },
  performanceCard: { gap: spacing.sm + 4 },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.textPrimary,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "center", gap: 2 },
  statValue: { fontSize: typography.bodyMedium.fontSize, fontWeight: "700", color: colors.textPrimary },
  statLabel: { fontSize: typography.caption.fontSize, color: colors.textSecondary },
  menuCard: { padding: 0, overflow: "hidden" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuLabel: { flex: 1, fontSize: typography.bodySmall.fontSize, fontWeight: "600", color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 28 },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  logoutLabel: { fontSize: typography.bodySmall.fontSize, fontWeight: "700", color: colors.error },
  sosRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginTop: spacing.xs,
  },
  sosLabel: { fontSize: typography.bodySmall.fontSize, fontWeight: "800", color: colors.error },
});
