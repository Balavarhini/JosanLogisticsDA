import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@constants/theme";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import type { Trip } from "@/types/trip";
import { formatDistanceKm, formatTime, formatWeightKg } from "@utils/format";

interface ShipmentCardProps {
  trip: Trip;
  onViewDetails: () => void;
  onNavigate: () => void;
}

/** Featured "active shipment" card — used on the Dashboard and Active Shipment screen. */
export function ShipmentCard({ trip, onViewDetails, onNavigate }: ShipmentCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.eyebrow}>ACTIVE SHIPMENT</Text>
      <View style={styles.row}>
        <Text style={styles.reference}>{trip.shipment.reference}</Text>
        <StatusBadge status={trip.status} />
      </View>

      <View style={styles.route}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {trip.pickup.line1}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: colors.navy }]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {trip.delivery.line1}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View>
          <Text style={styles.metaLabel}>ETA</Text>
          <Text style={styles.metaValue}>{formatTime(trip.estimatedArrival)}</Text>
        </View>
        <View>
          <Text style={styles.metaLabel}>Weight</Text>
          <Text style={styles.metaValue}>{formatWeightKg(trip.shipment.weightKg)}</Text>
        </View>
        <View>
          <Text style={styles.metaLabel}>Distance</Text>
          <Text style={styles.metaValue}>{formatDistanceKm(trip.distanceKm)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <SecondaryButton label="View Details" onPress={onViewDetails} style={styles.actionButton} />
        <PrimaryButton label="Navigate" onPress={onNavigate} style={styles.actionButton} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm + 4,
  },
  eyebrow: {
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reference: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.textPrimary,
  },
  route: {
    gap: 4,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm + 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 3,
  },
  routeText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
  },
});

export default ShipmentCard;
