import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@constants/theme";
import { useTrip } from "@/hooks/useTrips";
import { TripStatus } from "@/types/trip";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { LocationCard } from "@/components/LocationCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const CHECKLIST = [
  "Verify package count matches the manifest",
  "Inspect packaging for visible damage",
  "Confirm pickup with the shipper",
];

/** Pickup Details — confirms arrival at pickup and marks the pickup complete. */
export default function PickupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trip, isLoading, error, refresh, advanceStatus } = useTrip(id);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading && !trip) return <LoadingState message="Loading pickup details…" />;
  if (error && !trip) return <ErrorState message={error} onRetry={refresh} />;
  if (!trip) return null;

  const allChecked = CHECKLIST.every((_, i) => checked[i]);

  const onCompletePickup = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await advanceStatus(TripStatus.PickupCompleted);
      router.replace({ pathname: "/trip/[id]", params: { id: trip.id } });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Couldn't confirm the pickup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.flex}>
      <Header title="Pickup Details" />
      <ScrollView contentContainerStyle={styles.content}>
        <LocationCard address={trip.pickup} variant="pickup" />

        <Card style={styles.shipmentCard}>
          <Text style={styles.sectionTitle}>Shipment</Text>
          <Text style={styles.shipmentLine}>{trip.shipment.cargoDescription}</Text>
          <Text style={styles.shipmentMeta}>
            {trip.shipment.packageCount} package(s) · {trip.shipment.weightKg.toFixed(1)} kg
          </Text>
        </Card>

        <Card style={styles.checklistCard}>
          <Text style={styles.sectionTitle}>Before you confirm</Text>
          {CHECKLIST.map((item, index) => {
            const isChecked = !!checked[index];
            return (
              <Pressable
                key={item}
                style={styles.checklistRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked }}
                accessibilityLabel={item}
                onPress={() => setChecked((prev) => ({ ...prev, [index]: !prev[index] }))}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                </View>
                <Text style={styles.checklistText}>{item}</Text>
              </Pressable>
            );
          })}
        </Card>

        {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

        <PrimaryButton
          label="Confirm Pickup Complete"
          onPress={onCompletePickup}
          disabled={!allChecked}
          loading={submitting}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontSize: typography.h3.fontSize, fontWeight: typography.h3.fontWeight, color: colors.textPrimary },
  shipmentCard: { gap: spacing.xs },
  shipmentLine: { fontSize: typography.bodySmall.fontSize, color: colors.textPrimary, marginTop: 4 },
  shipmentMeta: { fontSize: typography.caption.fontSize, color: colors.textSecondary },
  checklistCard: { gap: spacing.sm + 4 },
  checklistRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checklistText: { flex: 1, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  error: { color: colors.error, fontSize: typography.bodySmall.fontSize, textAlign: "center" },
});
