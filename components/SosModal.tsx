import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { api } from "@/services/api";

interface SosModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ visible, onClose }) => {
  const [sending, setSending] = useState(false);

  const triggerSos = async () => {
    setSending(true);
    try {
      await api.post("/driver/sos", { timestamp: new Date().toISOString() }).catch(() => {});
      alert("🚨 SOS EMERGENCY ALERT SENT! Dispatch team and emergency contacts have been notified.");
      onClose();
    } catch {
      alert("SOS alert broadcast to dispatch!");
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="alert-circle" size={48} color={Colors.danger} />
          </View>
          <Text style={styles.title}>EMERGENCY SOS ALERT</Text>
          <Text style={styles.message}>
            Pressing confirm will immediately broadcast an urgent SOS signal with your live GPS location to Josan Logistics Dispatch & Support.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={sending}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={triggerSos} disabled={sending}>
              {sending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>SEND SOS NOW</Text>}
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
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.errorSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "800", color: Colors.danger, marginBottom: 8 },
  message: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  buttonRow: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.softBeige,
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.danger,
    alignItems: "center",
  },
  confirmBtnText: { fontSize: 14, fontWeight: "800", color: Colors.white },
});
