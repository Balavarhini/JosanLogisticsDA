import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius, spacing, typography } from "@constants/theme";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

/** Standard labeled text input used across Login and other forms. */
export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  input: {
    height: 52,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: typography.caption.fontSize,
    color: colors.error,
  },
});

export default TextField;
