import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, typography } from "@constants/theme";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";
import { SecondaryButton } from "./SecondaryButton";
import type { Trip } from "@/types/trip";

interface TripCardProps {
  trip: Trip;
}

/** Summary card for a trip, shown in lists (My Trips, Dashboard). */
export function TripCard({ trip }: TripCardProps) {
  const router = useRouter();
  const open = () => router.push({ pathname: "/trip/[id]", params: { id: trip.id } });

  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`Trip ${trip.reference}`}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.reference}>TRIP #{trip.reference}</Text>
          <StatusBadge status={trip.status} />
        </View>
        <View style={styles.details}>
          <Text style={styles.caption} numberOfLines={1}>
            Pickup: {trip.pickup.line1}
          </Text>
          <Text style={styles.caption} numberOfLines={1}>
            Delivery: {trip.delivery.line1}
          </Text>
        </View>
        <SecondaryButton label="View Trip" onPress={open} style={styles.button} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm + 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reference: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  details: {
    gap: 4,
  },
  caption: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  button: {
    minHeight: 40,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
  },
});

export default TripCard;
