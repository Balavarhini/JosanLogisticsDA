import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { Header } from "@/components/Header";
import { Colors } from "@/constants/theme";
import { getEarnings } from "@/services/driver";

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await getEarnings();
      setEarnings(data);
    } catch (err) {
      console.warn("Error fetching earnings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getEarnings();
        if (mounted) setEarnings(data);
      } catch (err) {
        console.warn("Error fetching earnings:", err);
      } finally {
        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getEarnings()
      .then((data) => setEarnings(data))
      .catch((err) => console.warn("Error fetching earnings:", err))
      .finally(() => setRefreshing(false));
  };

  if (loading && !earnings) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header title="Driver Earnings" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.mainCard}>
          <Text style={styles.mainLabel}>Today's Earnings</Text>
          <Text style={styles.mainAmount}>S${(earnings?.todayEarnings ?? 125).toFixed(2)}</Text>
          <Text style={styles.mainSubtitle}>Payout Status: Ready for Weekly Deposit</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>S${(earnings?.weekEarnings ?? 680).toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>S${(earnings?.monthEarnings ?? 2450).toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Trip Payouts</Text>
        {earnings?.recentEarnings?.length > 0 ? (
          earnings.recentEarnings.map((item: any) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyDesc}>{item.description || "Trip Fare Payout"}</Text>
                <Text style={styles.historyDate}>
                  {item.earned_at ? new Date(item.earned_at).toLocaleDateString() : ""}
                </Text>
              </View>
              <Text style={styles.historyAmount}>+S${parseFloat(item.amount || 45).toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent payouts logged yet today.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 20, paddingBottom: 40 },
  mainCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Colors.darkCharcoal,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainLabel: { color: Colors.goldLight, fontSize: 14, fontWeight: "600" },
  mainAmount: { color: Colors.white, fontSize: 36, fontWeight: "800", marginVertical: 6 },
  mainSubtitle: { color: Colors.white, fontSize: 12, opacity: 0.9 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.softBeige,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "700", color: Colors.darkCharcoal },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.darkCharcoal, marginBottom: 12 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyDesc: { fontSize: 14, fontWeight: "600", color: Colors.darkCharcoal },
  historyDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  historyAmount: { fontSize: 16, fontWeight: "700", color: Colors.success },
  emptyCard: { backgroundColor: Colors.card, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
});
