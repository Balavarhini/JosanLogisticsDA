import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Header } from "@/components/Header";
import { Colors } from "@/constants/theme";
import { getVehicle } from "@/services/driver";

export default function VehicleScreen() {
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicle()
      .then((data) => setVehicle(data))
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header title="Assigned Vehicle Details" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.plateText}>{vehicle?.vehiclePlate || "GBB 8888 X"}</Text>
          <Text style={styles.modelText}>{vehicle?.vehicleType || "Toyota HiAce (1000kg)"}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>🟢 Operational</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <DetailRow label="Vehicle Type" value={vehicle?.vehicleType} />
          <DetailRow label="Cargo Capacity" value={`${vehicle?.capacityKg || 1000} kg`} />
          <DetailRow label="Current Odometer" value={`${vehicle?.odometerKm || 45200} km`} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Compliance & Inspection</Text>
          <DetailRow label="Insurance Expiry" value={vehicle?.insuranceExpiry || "2027-04-30"} />
          <DetailRow label="LTA Inspection Expiry" value={vehicle?.inspectionExpiry || "2027-01-15"} />
          <DetailRow label="Maintenance Status" value="Passed (Up to date)" />
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 20, gap: 16 },
  headerCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  plateText: { color: "#F77F28", fontSize: 26, fontWeight: "800", letterSpacing: 1 },
  modelText: { color: "#9CA3AF", fontSize: 14, marginTop: 4 },
  statusBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  statusText: { color: "#34D399", fontSize: 12, fontWeight: "700" },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 14 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  label: { fontSize: 14, color: "#6B7280" },
  value: { fontSize: 14, fontWeight: "600", color: "#111827" },
});
