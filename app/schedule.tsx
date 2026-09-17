import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Header } from "@/components/Header";
import { Colors } from "@/constants/theme";
import { getSchedule } from "@/services/driver";

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchedule()
      .then((data) => setSchedule(data))
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
      <Header title="Shift & Job Schedule" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.todayCard}>
          <Text style={styles.todayTitle}>Today's Shift: 08:00 AM – 06:00 PM</Text>
          <Text style={styles.todaySub}>Hub: Singapore Central Warehouse</Text>
        </View>

        <Text style={styles.sectionTitle}>Assigned Timeline</Text>
        {schedule.length > 0 ? (
          schedule.map((item, idx) => (
            <View key={item.id || idx} style={styles.itemCard}>
              <Text style={styles.refText}>{item.reference || `TRIP-${idx + 1}`}</Text>
              <Text style={styles.timeText}>
                Scheduled: {new Date(item.scheduled_start || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.addrText}>📍 Pickup: {item.pickup_label || "Changi Logistics Hub"}</Text>
              <Text style={styles.addrText}>🏁 Delivery: {item.delivery_label || "Singapore Destination"}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No scheduled jobs for the rest of today.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 20, gap: 16 },
  todayCard: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 20,
  },
  todayTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  todaySub: { color: "#FFEAD5", fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 8 },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  refText: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
  timeText: { fontSize: 13, color: Colors.primary, fontWeight: "600", marginBottom: 8 },
  addrText: { fontSize: 14, color: "#374151", marginBottom: 4 },
  emptyCard: { backgroundColor: "#FFF", padding: 20, borderRadius: 12, alignItems: "center" },
  emptyText: { color: "#6B7280", fontSize: 14 },
});
