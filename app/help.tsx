import React, { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@constants/theme";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";

const FAQS = [
  {
    question: "What do I do if a customer isn't available for delivery?",
    answer:
      "Open the trip, tap \"Report an Issue\" on the Delivery Details screen and select \"Customer unavailable.\" Dispatch will be notified automatically.",
  },
  {
    question: "How do I request an OTP again?",
    answer: "On the OTP screen, tap \"Resend code\" once the countdown reaches zero.",
  },
  {
    question: "Why isn't Live Tracking updating?",
    answer: "Make sure Location Sharing is enabled in Settings and that location permission is granted for the app.",
  },
  {
    question: "How do I update my vehicle or documents?",
    answer: "Document updates are managed by your dispatch supervisor — contact support below to request a change.",
  },
];

/** Help & Support — FAQs plus direct contact options for dispatch. */
export default function HelpScreen() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={styles.flex}>
      <Header title="Help & Support" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contact Dispatch</Text>
          <Pressable style={styles.contactRow} onPress={() => Linking.openURL("tel:+18005551234")} accessibilityRole="button">
            <Ionicons name="call" size={18} color={colors.primary} />
            <Text style={styles.contactText}>Call Dispatch Support</Text>
          </Pressable>
          <Pressable
            style={styles.contactRow}
            onPress={() => Linking.openURL("mailto:support@josanlogistics.com")}
            accessibilityRole="button"
          >
            <Ionicons name="mail" size={18} color={colors.primary} />
            <Text style={styles.contactText}>support@josanlogistics.com</Text>
          </Pressable>
        </Card>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Card style={styles.faqCard}>
          {FAQS.map((faq, index) => {
            const isOpen = expanded === index;
            return (
              <View key={faq.question}>
                <Pressable
                  style={styles.faqRow}
                  onPress={() => setExpanded(isOpen ? null : index)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
                </Pressable>
                {isOpen ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
                {index < FAQS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontSize: typography.h3.fontSize, fontWeight: typography.h3.fontWeight, color: colors.textPrimary },
  contactCard: { gap: spacing.sm + 2 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  contactText: { fontSize: typography.bodySmall.fontSize, fontWeight: "600", color: colors.textPrimary },
  faqCard: { padding: 0, overflow: "hidden" },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  faqQuestion: { flex: 1, fontSize: typography.bodySmall.fontSize, fontWeight: "600", color: colors.textPrimary },
  faqAnswer: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
});
