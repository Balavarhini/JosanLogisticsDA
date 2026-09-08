import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useTrip } from "@/hooks/useTrips";
import { formatDate, formatTime } from "@utils/format";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

/**
 * Delivery Confirmation — success screen shown right after Proof of Delivery
 * is submitted. Reads back whatever POD data the backend returned on the
 * trip; if a field wasn't captured (e.g. no photo) that row is simply omitted.
 */
export default function DeliveryConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trip, isLoading, error, refresh } = useTrip(id);

  if (isLoading && !trip) return <LoadingState message="Finalizing delivery…" />;
  if (error && !trip) return <ErrorState message={error} onRetry={refresh} />;
  if (!trip) return null;

  const pod = trip.pod;
  const deliveredAt = pod?.deliveredAt ?? trip.updatedAt;

  const onDone = () => router.replace("/(tabs)/dashboard");

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={40} color={colors.white} />
        </View>
        <Text style={styles.title}>Delivery Confirmed</Text>
        <Text style={styles.subtitle}>
          Trip #{trip.reference} · {trip.shipment.reference}
        </Text>

        <Card style={styles.detailsCard}>
          <DetailRow label="Delivered On" value={`${formatDate(deliveredAt)} · ${formatTime(deliveredAt)}`} />
          <DetailRow label="Recipient" value={trip.delivery.contactName ?? "—"} />
          <DetailRow label="Address" value={trip.delivery.line1} />
          {pod?.deliveredLocation ? (
            <DetailRow
              label="Location"
              value={`${pod.deliveredLocation.latitude.toFixed(5)}, ${pod.deliveredLocation.longitude.toFixed(5)}`}
            />
          ) : null}
          <DetailRow label="Confirmation" value="Verified via OTP" />
        </Card>

        {pod?.signatureUri || pod?.photoUri ? (
          <Card style={styles.mediaCard}>
            {pod.signatureUri ? (
              <View style={styles.mediaBlock}>
                <Text style={styles.mediaLabel}>Signature</Text>
                <Image source={{ uri: pod.signatureUri }} style={styles.signatureImage} resizeMode="contain" />
              </View>
            ) : null}
            {pod.photoUri ? (
              <View style={styles.mediaBlock}>
                <Text style={styles.mediaLabel}>Delivery Photo</Text>
                <Image source={{ uri: pod.photoUri }} style={styles.photoImage} />
              </View>
            ) : null}
          </Card>
        ) : null}

        {pod?.remarks ? (
          <Card style={styles.remarksCard}>
            <Text style={styles.mediaLabel}>Remarks</Text>
            <Text style={styles.remarksText}>{pod.remarks}</Text>
          </Card>
        ) : null}

        <PrimaryButton label="Done" onPress={onDone} style={styles.done} />
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, alignItems: "center", gap: spacing.md, paddingBottom: spacing.xxl },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
    marginBottom: spacing.xs,
  },
  title: { fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: colors.textPrimary },
  subtitle: { fontSize: typography.bodySmall.fontSize, color: colors.textSecondary, marginBottom: spacing.sm },
  detailsCard: { width: "100%", gap: spacing.sm + 2 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  detailLabel: { fontSize: typography.bodySmall.fontSize, color: colors.textSecondary },
  detailValue: { flex: 1, fontSize: typography.bodySmall.fontSize, fontWeight: "600", color: colors.textPrimary, textAlign: "right" },
  mediaCard: { width: "100%", gap: spacing.md },
  mediaBlock: { gap: spacing.xs },
  mediaLabel: { fontSize: typography.caption.fontSize, fontWeight: "700", color: colors.textSecondary },
  signatureImage: { width: "100%", height: 100, borderRadius: radius.card - 2, backgroundColor: colors.background },
  photoImage: { width: "100%", height: 160, borderRadius: radius.card - 2 },
  remarksCard: { width: "100%", gap: spacing.xs },
  remarksText: { fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  done: { width: "100%", marginTop: spacing.md },
});
