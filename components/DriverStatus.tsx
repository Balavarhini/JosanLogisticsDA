import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@constants/theme";
import { Card } from "./Card";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import type { DutyStatus } from "@/types/driver";

interface DriverStatusProps {
  status: DutyStatus;
  onToggle: () => void;
  loading?: boolean;
}

/** Duty-status card on the Dashboard — driver goes online/offline from here. */
export function DriverStatus({ status, onToggle, loading }: DriverStatusProps) {
  const isOnline = status === "online";

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>YOUR STATUS</Text>
        <View style={styles.badge}>
          <View style={[styles.dot, { backgroundColor: isOnline ? colors.success : colors.textSecondary }]} />
          <Text style={[styles.badgeText, { color: isOnline ? colors.success : colors.textSecondary }]}>
            {isOnline ? "ONLINE" : "OFFLINE"}
          </Text>
        </View>
      </View>
      {isOnline ? (
        <SecondaryButton label="Go Offline" onPress={onToggle} disabled={loading} />
      ) : (
        <PrimaryButton label="Go Online" onPress={onToggle} loading={loading} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm + 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
});

export default DriverStatus;
