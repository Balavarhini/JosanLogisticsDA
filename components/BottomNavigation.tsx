import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors, spacing, typography } from "@constants/theme";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  dashboard: "home",
  trips: "list",
  notifications: "notifications",
  profile: "person",
};

const LABELS: Record<string, string> = {
  dashboard: "Home",
  trips: "Trips",
  notifications: "Alerts",
  profile: "Profile",
};

/**
 * Custom tab bar used by app/(tabs)/_layout.tsx. Kept as its own component
 * (rather than inline screenOptions) so it matches BottomNavigation in the
 * design reference and can be reused/tested independently.
 */
export function BottomNavigation({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrap}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconName = ICONS[route.name] ?? "ellipse";
        const label = LABELS[route.name] ?? route.name;
        const color = isFocused ? colors.primary : colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label}
            style={styles.item}
            hitSlop={8}
          >
            <Ionicons name={iconName} size={22} color={color} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  item: {
    alignItems: "center",
    gap: 4,
    minWidth: 56,
    paddingVertical: 4,
  },
  label: {
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
  },
});

export default BottomNavigation;
