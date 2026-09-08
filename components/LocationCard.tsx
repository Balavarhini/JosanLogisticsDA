import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { Card } from "./Card";
import type { Address } from "@/types/trip";

interface LocationCardProps {
  address: Address;
  variant?: "pickup" | "delivery";
  showContact?: boolean;
}

/** Displays a pickup/delivery address, with an optional call-contact row. */
export function LocationCard({ address, variant = "pickup", showContact = true }: LocationCardProps) {
  const dotColor = variant === "pickup" ? colors.primary : colors.navy;

  const call = () => {
    if (address.contactPhone) Linking.openURL(`tel:${address.contactPhone}`);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <View style={styles.textCol}>
          <Text style={styles.eyebrow}>{variant === "pickup" ? "PICKUP" : "DELIVERY"}</Text>
          <Text style={styles.line} numberOfLines={2}>
            {address.line1}
          </Text>
          {address.line2 ? <Text style={styles.subLine}>{address.line2}</Text> : null}
        </View>
      </View>

      {showContact && (address.contactName || address.contactPhone) ? (
        <View style={styles.contactRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(address.contactName ?? "?").slice(0, 1)}</Text>
          </View>
          <View style={styles.textCol}>
            {address.contactName ? <Text style={styles.contactName}>{address.contactName}</Text> : null}
            {address.contactPhone ? <Text style={styles.subLine}>{address.contactPhone}</Text> : null}
          </View>
          {address.contactPhone ? (
            <Pressable
              onPress={call}
              accessibilityRole="button"
              accessibilityLabel={`Call ${address.contactName ?? "contact"}`}
              style={styles.callButton}
              hitSlop={8}
            >
              <Ionicons name="call" size={18} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  line: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  subLine: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontWeight: "700",
  },
  contactName: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LocationCard;
