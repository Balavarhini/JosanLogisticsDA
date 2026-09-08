import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, typography } from "@constants/theme";
import { useTrip } from "@/hooks/useTrips";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { LocationCard } from "@/components/LocationCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

/** Delivery Details — final address/instructions review before capturing proof of delivery. */
export default function DeliveryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trip, isLoading, error, refresh } = useTrip(id);

  if (isLoading && !trip) return <LoadingState message="Loading delivery details…" />;
  if (error && !trip) return <ErrorState message={error} onRetry={refresh} />;
  if (!trip) return null;

  return (
    <View style={styles.flex}>
      <Header title="Delivery Details" />
      <ScrollView contentContainerStyle={styles.content}>
        <LocationCard address={trip.delivery} variant="delivery" />

        <Card style={styles.shipmentCard}>
          <Text style={styles.sectionTitle}>Shipment</Text>
          <Text style={styles.shipmentLine}>{trip.shipment.cargoDescription}</Text>
          <Text style={styles.shipmentMeta}>
            {trip.shipment.packageCount} package(s) · {trip.shipment.weightKg.toFixed(1)} kg
          </Text>
        </Card>

        {trip.delivery.notes ? (
          <Card style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Delivery Instructions</Text>
            <Text style={styles.notesText}>{trip.delivery.notes}</Text>
          </Card>
        ) : null}

        <PrimaryButton
          label="Proceed to Proof of Delivery"
          onPress={() => router.push({ pathname: "/pod/[id]", params: { id: trip.id } })}
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
  notesCard: { gap: spacing.xs },
  notesText: { fontSize: typography.bodySmall.fontSize, color: colors.textPrimary, marginTop: 4 },
});
