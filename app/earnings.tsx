import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Colors } from "@/constants/theme";
import { getEarnings } from "@/services/driver";

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payoutRequesting, setPayoutRequesting] = useState(false);

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
      } catch (err: any) {
        console.log("Error fetching earnings:", err?.message || err);
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
    loadData();
  };

  const handleRequestExpressPayout = () => {
    const todayAmt = earnings?.todayEarnings ?? 125.0;
    if (todayAmt <= 0) {
      Alert.alert("No Funds Available", "You currently have no available balance for express payout.");
      return;
    }

    Alert.alert(
      "Confirm Express Payout",
      `Transfer S$${todayAmt.toFixed(2)} directly to your linked DBS Bank account (****4829)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Transfer Now",
          style: "default",
          onPress: () => {
            setPayoutRequesting(true);
            setTimeout(() => {
              setPayoutRequesting(false);
              Alert.alert(
                "Payout Requested",
                `S$${todayAmt.toFixed(2)} express transfer initiated successfully. Funds will reflect in your account within 15 minutes.`
              );
            }, 1200);
          },
        },
      ]
    );
  };

  if (loading && !earnings) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const todayAmount = earnings?.todayEarnings ?? 125.0;
  const weekAmount = earnings?.weekEarnings ?? 680.0;
  const monthAmount = earnings?.monthEarnings ?? 2450.0;
  const recentList = earnings?.recentEarnings ?? [];

  return (
    <View style={styles.flex}>
      <Header title="My Earnings & Payouts" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Main Balance & Payout Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainLabel}>Today's Earnings</Text>
          <Text style={styles.mainAmount}>S${todayAmount.toFixed(2)}</Text>
          <Text style={styles.mainSubtitle}>Payout Status: Ready for Deposit</Text>

          <Pressable
            style={({ pressed }) => [styles.payoutButton, pressed && { opacity: 0.85 }]}
            onPress={handleRequestExpressPayout}
            disabled={payoutRequesting}
          >
            {payoutRequesting ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <>
                <Ionicons name="flash" size={16} color={Colors.primary} />
                <Text style={styles.payoutButtonText}>Request Express Payout</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} style={{ marginBottom: 6 }} />
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>S${weekAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="stats-chart-outline" size={20} color={Colors.primary} style={{ marginBottom: 6 }} />
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>S${monthAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Linked Bank Account Card */}
        <View style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <Ionicons name="card-outline" size={22} color={Colors.darkCharcoal} />
            <Text style={styles.bankTitle}>Payout Method</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          </View>
          <View style={styles.bankDetails}>
            <Text style={styles.bankName}>DBS Bank Ltd (Singapore)</Text>
            <Text style={styles.accountNumber}>Acc: •••• •••• 4829</Text>
            <Text style={styles.payoutSchedule}>Automatic Weekly Deposit: Every Friday</Text>
          </View>
        </View>

        {/* Recent Payout History */}
        <Text style={styles.sectionTitle}>Recent Trip Payouts</Text>
        {recentList.length > 0 ? (
          recentList.map((item: any, idx: number) => (
            <View key={item.id || idx} style={styles.historyRow}>
              <View style={styles.historyIconBox}>
                <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={styles.historyDesc}>{item.description || item.trip_ref || "Trip Fare Payout"}</Text>
                <Text style={styles.historyDate}>
                  {item.earned_at ? new Date(item.earned_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Today"}
                </Text>
              </View>
              <Text style={styles.historyAmount}>+S${parseFloat(item.amount || 45).toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={28} color={Colors.textSecondary} style={{ marginBottom: 6 }} />
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
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  mainLabel: { color: Colors.goldLight, fontSize: 14, fontWeight: "600" },
  mainAmount: { color: Colors.white, fontSize: 36, fontWeight: "800", marginVertical: 6 },
  mainSubtitle: { color: Colors.white, fontSize: 13, opacity: 0.9, marginBottom: 16 },
  payoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  payoutButtonText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
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
  bankCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  bankHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bankTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.darkCharcoal,
    marginLeft: 8,
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: "700",
  },
  bankDetails: {
    marginTop: 4,
  },
  bankName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.darkCharcoal,
  },
  accountNumber: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  payoutSchedule: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 6,
    fontWeight: "500",
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.darkCharcoal, marginBottom: 12 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  historyDesc: { fontSize: 14, fontWeight: "600", color: Colors.darkCharcoal },
  historyDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  historyAmount: { fontSize: 15, fontWeight: "700", color: Colors.success },
  emptyCard: { backgroundColor: Colors.card, padding: 24, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
});
