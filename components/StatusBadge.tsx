import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, typography } from "@constants/theme";
import { TripStatus } from "@/types/trip";
import { getTripStatusPresentation } from "@utils/tripStatus";

interface StatusBadgeProps {
  status: TripStatus;
}

/** Pill badge showing a trip status. Always icon (dot) + text — never color alone. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color, softColor } = getTripStatusPresentation(status);
  return (
    <View style={[styles.wrap, { backgroundColor: softColor }]} accessibilityRole="text" accessibilityLabel={`Status: ${label}`}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
});

export default StatusBadge;
