import React, { useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useTrip } from "@/hooks/useTrips";
import { useLocation } from "@/hooks/useLocation";
import { TripStatus } from "@/types/trip";
import { formatTime } from "@utils/format";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { SignaturePad, SignaturePadHandle } from "@/components/SignaturePad";
import { OtpInput } from "@/components/OtpInput";
import { TextField } from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

/** Proof of Delivery — signature, photo, OTP confirmation, remarks, timestamp and location. */
export default function ProofOfDeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trip, isLoading, error, refresh, submitPod, advanceStatus } = useTrip(id);
  const { location, refresh: refreshLocation } = useLocation();

  const signatureRef = useRef<SignaturePadHandle>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading && !trip) return <LoadingState message="Loading delivery…" />;
  if (error && !trip) return <ErrorState message={error} onRetry={refresh} />;
  if (!trip) return null;

  const now = new Date();
  const otpValid = otp.length === 6;
  const canSubmit = hasSignature && otpValid && !submitting;

  const pickPhoto = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      setSubmitError("Camera/photo permission is required to attach a delivery photo.");
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: false });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setSubmitError(null);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const onSubmit = async () => {
    setSubmitError(null);
    if (!hasSignature) {
      setSubmitError("Please capture the recipient's signature.");
      return;
    }
    if (!otpValid) {
      setSubmitError("Enter the 6-digit delivery confirmation code.");
      return;
    }

    setSubmitting(true);
    try {
      const signatureUri = (await signatureRef.current?.captureAsync()) ?? undefined;
      await refreshLocation();

      await submitPod({
        signatureUri,
        photoUri: photoUri ?? undefined,
        otpVerified: true,
        remarks: remarks.trim() || undefined,
        deliveredAt: new Date().toISOString(),
        deliveredLocation: location ?? undefined,
      });
      await advanceStatus(TripStatus.DeliveryCompleted);
      router.replace({ pathname: "/delivery-confirmation/[id]", params: { id: trip.id } });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Couldn't submit proof of delivery. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Header title="Proof of Delivery" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Recipient Signature</Text>
          <SignaturePad ref={signatureRef} onChange={setHasSignature} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Photo (optional)</Text>
          {photoUri ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <Pressable onPress={() => setPhotoUri(null)} style={styles.photoRemove} accessibilityLabel="Remove photo">
                <Ionicons name="close" size={16} color={colors.white} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoActions}>
              <Pressable style={styles.photoButton} onPress={() => pickPhoto(true)} accessibilityRole="button">
                <Ionicons name="camera-outline" size={20} color={colors.primary} />
                <Text style={styles.photoButtonLabel}>Take Photo</Text>
              </Pressable>
              <Pressable style={styles.photoButton} onPress={() => pickPhoto(false)} accessibilityRole="button">
                <Ionicons name="image-outline" size={20} color={colors.primary} />
                <Text style={styles.photoButtonLabel}>Choose Photo</Text>
              </Pressable>
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Confirmation Code</Text>
          <Text style={styles.helperText}>Ask the recipient for the 6-digit code sent to their phone.</Text>
          <OtpInput value={otp} onChange={setOtp} />
        </Card>

        <Card style={styles.section}>
          <TextField
            label="Remarks (optional)"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="e.g. Left with front desk"
            multiline
            numberOfLines={3}
            style={styles.remarksInput}
          />
        </Card>

        <Card style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>Captured at {formatTime(now.toISOString())}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : "Location will be captured on submit"}
            </Text>
          </View>
        </Card>

        {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

        <PrimaryButton label="Submit Proof of Delivery" onPress={onSubmit} disabled={!canSubmit} loading={submitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: typography.h3.fontSize, fontWeight: typography.h3.fontWeight, color: colors.textPrimary },
  helperText: { fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: 2 },
  photoActions: { flexDirection: "row", gap: spacing.sm + 2 },
  photoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: spacing.sm + 4,
  },
  photoButtonLabel: { fontSize: typography.bodySmall.fontSize, fontWeight: "700", color: colors.primary },
  photoPreviewWrap: { position: "relative", alignSelf: "flex-start" },
  photoPreview: { width: 120, height: 120, borderRadius: radius.card - 2 },
  photoRemove: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  remarksInput: { height: 90, textAlignVertical: "top", paddingTop: spacing.sm + 4 },
  metaCard: { gap: spacing.sm },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  metaText: { fontSize: typography.caption.fontSize, color: colors.textSecondary },
  error: { color: colors.error, fontSize: typography.bodySmall.fontSize, textAlign: "center" },
});
