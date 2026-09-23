import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radius, shadow, spacing, typography } from "@constants/theme";
import {
  getPreferredNavApp,
  launchNavigationApp,
  NAV_APP_OPTIONS,
  NavAppChoice,
  NavDestination,
  setPreferredNavApp,
} from "@utils/navigation";

interface NavigationAppModalProps {
  visible: boolean;
  destination: NavDestination | null;
  onClose: () => void;
}

export function NavigationAppModal({
  visible,
  destination,
  onClose,
}: NavigationAppModalProps) {
  const [rememberPreference, setRememberPreference] = useState(true);
  const [preferredApp, setPreferredApp] = useState<NavAppChoice | null>(null);

  useEffect(() => {
    if (visible) {
      getPreferredNavApp().then(setPreferredApp);
    }
  }, [visible]);

  if (!destination) return null;

  const filteredOptions = NAV_APP_OPTIONS.filter(
    (opt) => opt.platform === "all" || (opt.platform === "ios" && Platform.OS === "ios")
  );

  const handleSelectApp = async (appId: NavAppChoice) => {
    if (rememberPreference) {
      await setPreferredNavApp(appId);
    }
    onClose();
    await launchNavigationApp(destination, appId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handleBar} />

          <Text style={styles.title}>Start Navigation 🧭</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {destination.label || destination.postalCode || "Destination"}
          </Text>

          <View style={styles.optionsList}>
            {filteredOptions.map((opt) => {
              const isPreferred = preferredApp === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, isPreferred && styles.optionCardActive]}
                  onPress={() => handleSelectApp(opt.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
                  <View style={styles.optionTextWrap}>
                    <View style={styles.optionTitleRow}>
                      <Text style={styles.optionName}>{opt.name}</Text>
                      {isPreferred ? (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                  </View>
                  <Text style={styles.arrowIcon}>chevron-right</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberPreference(!rememberPreference)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, rememberPreference && styles.checkboxChecked]}>
              {rememberPreference ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.rememberText}>Remember my choice for future trips</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    ...shadow.floating,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: -spacing.xs,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionIcon: {
    fontSize: 26,
  },
  optionTextWrap: {
    flex: 1,
    gap: 2,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  optionName: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  optionSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  arrowIcon: {
    fontSize: 14,
    color: colors.textMuted,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  rememberText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    backgroundColor: colors.neutralSoft,
  },
  cancelText: {
    fontSize: typography.button.fontSize,
    fontWeight: "600",
    color: colors.textSecondary,
  },
});
