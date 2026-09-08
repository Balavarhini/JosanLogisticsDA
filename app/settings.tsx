import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Constants from "expo-constants";
import { colors, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { SecondaryButton } from "@/components/SecondaryButton";

/**
 * Settings — local app preferences plus account actions. These toggles are
 * device-local (AsyncStorage-backed in a full build); nothing here talks to
 * the backend directly, per the services-layer rule.
 */
export default function SettingsScreen() {
  const { logout } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View style={styles.flex}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <Card style={styles.card}>
          <SettingRow
            label="Push Notifications"
            description="Trip assignments, alerts and updates"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Location Sharing"
            description="Required for live tracking during active trips"
            value={locationSharing}
            onValueChange={setLocationSharing}
          />
        </Card>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <Card style={styles.card}>
          <SecondaryButton label="Log Out" onPress={() => setConfirmingLogout(true)} />
        </Card>

        <Text style={styles.version}>JOSAN Driver App · v{appVersion}</Text>
      </ScrollView>

      <ConfirmationModal
        visible={confirmingLogout}
        title="Log out?"
        message="You'll need to sign in again to view your trips."
        confirmLabel="Log Out"
        destructive
        onConfirm={async () => {
          setConfirmingLogout(false);
          await logout();
        }}
        onCancel={() => setConfirmingLogout(false)}
      />
    </View>
  );
}

function SettingRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  sectionLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: { gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: typography.bodyMedium.fontSize, fontWeight: "600", color: colors.textPrimary },
  rowDescription: { fontSize: typography.caption.fontSize, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border },
  version: { textAlign: "center", fontSize: typography.caption.fontSize, color: colors.textMuted, marginTop: spacing.lg },
});
