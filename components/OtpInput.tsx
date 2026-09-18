import React, { useRef } from "react";
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputKeyPressEventData, View } from "react-native";
import { colors, radius } from "@constants/theme";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

/** Six-box OTP entry. Backspace moves focus to the previous box. */
export function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = value.padEnd(length, " ").split("").slice(0, length);

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit || " ";
    onChange(next.join("").trimEnd());
    if (digit && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const onKeyPress = (index: number) => (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index].trim() && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row} accessibilityLabel="One-time passcode">
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          value={digit.trim()}
          onChangeText={(text) => setDigit(index, text.replace(/[^0-9]/g, "").slice(-1))}
          onKeyPress={onKeyPress(index)}
          keyboardType="number-pad"
          maxLength={1}
          style={[styles.box, digit.trim() && styles.boxFilled]}
          accessibilityLabel={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
  },
  box: {
    width: 44,
    height: 54,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.warmOffWhite,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
});

export default OtpInput;
