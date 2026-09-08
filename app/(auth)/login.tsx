import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { ApiRequestError } from "@/types/api";
import { TextField } from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";

/** Driver Login screen — employee ID / phone + password, per requirement #4. */
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [employeeIdOrPhone, setEmployeeIdOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!employeeIdOrPhone.trim()) errors.employeeIdOrPhone = "Enter your employee ID or phone number.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async () => {
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await login({ employeeIdOrPhone: employeeIdOrPhone.trim(), password });
      if (result.requiresOtp) {
        router.push("/(auth)/otp");
      }
      // If no OTP is required, AuthProvider's token update flips
      // isAuthenticated and the root RouteGuard redirects to the dashboard.
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFieldErrors(err.fieldErrors ?? {});
        setFormError(err.message);
      } else {
        setFormError("Unable to sign in. Check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.markWrap}>
          <MaterialCommunityIcons name="truck-fast" size={36} color={colors.white} />
        </View>
        <Text style={styles.title}>JOSAN LOGISTICS</Text>
        <Text style={styles.subtitle}>Sign in to start your shift</Text>

        <View style={styles.form}>
          <TextField
            label="Employee ID or Phone"
            value={employeeIdOrPhone}
            onChangeText={(text) => {
              setEmployeeIdOrPhone(text);
              if (fieldErrors.employeeIdOrPhone) setFieldErrors((prev) => ({ ...prev, employeeIdOrPhone: "" }));
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            error={fieldErrors.employeeIdOrPhone}
            returnKeyType="next"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
            }}
            secureTextEntry
            autoCapitalize="none"
            error={fieldErrors.password}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <PrimaryButton label="Sign In" onPress={onSubmit} loading={submitting} style={styles.submit} />
        </View>

        <Text style={styles.footer}>Having trouble signing in? Contact your dispatch supervisor.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    alignItems: "center",
    padding: spacing.xl,
    paddingTop: spacing.xxl * 2,
    gap: spacing.xs,
  },
  markWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  form: {
    width: "100%",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  submit: {
    marginTop: spacing.xs,
  },
  formError: {
    color: colors.error,
    fontSize: typography.bodySmall.fontSize,
    textAlign: "center",
  },
  footer: {
    marginTop: spacing.xxl,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    textAlign: "center",
  },
});
