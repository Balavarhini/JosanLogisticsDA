import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { ApiRequestError } from "@/types/api";
import { OtpInput } from "@/components/OtpInput";
import { PrimaryButton } from "@/components/PrimaryButton";

const RESEND_COOLDOWN_SECONDS = 30;

/** OTP / authentication step shown after login when the backend requires 2FA. */
export default function OtpScreen() {
  const { verifyOtp, resendOtp, pendingOtpToken } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // No OTP challenge in flight (e.g. deep-linked directly) — go back to login.
    if (!pendingOtpToken) {
      router.replace("/(auth)/login");
    }
  }, [pendingOtpToken]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const onVerify = async (value: string) => {
    setError(null);
    if (value.length < 6) {
      setError("Enter the 6-digit code sent to your phone.");
      return;
    }
    setSubmitting(true);
    try {
      await verifyOtp(value);
      // Success flips isAuthenticated; root RouteGuard redirects to the dashboard.
    } catch (err) {
      setCode("");
      setError(err instanceof ApiRequestError ? err.message : "That code didn't work. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setResending(true);
    try {
      await resendOtp();
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError("Couldn't resend the code. Please try again in a moment.");
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Identity</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code we sent to your registered phone number.</Text>

      <View style={styles.otpWrap}>
        <OtpInput value={code} onChange={setCode} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton label="Verify" onPress={() => onVerify(code)} loading={submitting} style={styles.verify} />

      <Text
        style={[styles.resend, (cooldown > 0 || resending) && styles.resendDisabled]}
        onPress={cooldown > 0 || resending ? undefined : onResend}
        accessibilityRole="button"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Resending…" : "Resend code"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    paddingTop: spacing.xxl * 2,
    alignItems: "center",
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  otpWrap: {
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.error,
    fontSize: typography.bodySmall.fontSize,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  verify: {
    marginTop: spacing.xs,
  },
  resend: {
    marginTop: spacing.xl,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "700",
    color: colors.primary,
  },
  resendDisabled: {
    color: colors.textMuted,
  },
});
