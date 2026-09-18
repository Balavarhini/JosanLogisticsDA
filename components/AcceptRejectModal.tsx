import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { colors, Colors } from "@/constants/theme";

interface AcceptRejectModalProps {
  visible: boolean;
  type: "accept" | "reject";
  tripReference: string;
  onClose: () => void;
  onConfirmAccept: () => Promise<void>;
  onConfirmReject: (reason: string, notes: string) => Promise<void>;
}

const REJECTION_REASONS = [
  "Vehicle unavailable",
  "Too far from pickup",
  "Schedule conflict",
  "Vehicle capacity issue",
  "Other",
];

export const AcceptRejectModal: React.FC<AcceptRejectModalProps> = ({
  visible,
  type,
  tripReference,
  onClose,
  onConfirmAccept,
  onConfirmReject,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REJECTION_REASONS[0]);
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (type === "accept") {
        await onConfirmAccept();
      } else {
        await onConfirmReject(selectedReason, notes);
      }
      onClose();
    } catch (err: any) {
      alert(err.message || "Action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {type === "accept" ? "Accept Job" : "Reject Job Assignment"}
          </Text>
          <Text style={styles.subtitle}>Trip Ref: {tripReference}</Text>

          {type === "accept" ? (
            <Text style={styles.bodyText}>
              Are you ready to accept this shipment assignment and proceed to the pickup location?
            </Text>
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Rejection Reason:</Text>
              {REJECTION_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.radioOption,
                    selectedReason === reason && styles.radioOptionSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text
                    style={[
                      styles.radioText,
                      selectedReason === reason && styles.radioTextSelected,
                    ]}
                  >
                    {selectedReason === reason ? "🔘 " : "⚪ "}
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.label, { marginTop: 12 }]}>Additional Notes (Optional):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Explain reason for dispatcher..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                type === "reject" && { backgroundColor: Colors.danger },
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.confirmBtnText}>
                  {type === "accept" ? "Confirm Accept" : "Confirm Reject"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.darkCharcoal,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.darkCharcoal,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  radioOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
  },
  radioOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radioText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  radioTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.warmOffWhite,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: "top",
    height: 70,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: colors.softBeige,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
});
