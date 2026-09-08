import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

/** Standard screen header: optional back button, centered-left title, optional right action. */
export function Header({ title, showBack = true, onBack, rightElement }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.iconButton}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {rightElement ?? <View style={styles.iconButton} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.textPrimary,
  },
});

export default Header;
