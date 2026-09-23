import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@constants/theme";

export const PROVIDER_GOOGLE = "google";

export function Marker(_props: { coordinate?: any; title?: string; pinColor?: string }) {
  return null;
}

export function Polyline(_props: { coordinates?: any[]; strokeColor?: string; strokeWidth?: number }) {
  return null;
}

export function UrlTile(_props: any) {
  return null;
}

export default function MapView({ style }: { style?: any; children?: React.ReactNode; [key: string]: any }) {
  return (
    <View style={[styles.webMapContainer, style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Live Map Preview</Text>
        <Text style={styles.subtitle}>
          Native Google Maps view (Active on Android / iOS native apps)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapContainer: {
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  content: {
    alignItems: "center",
    gap: spacing.xs,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 300,
  },
});
