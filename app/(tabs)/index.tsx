import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import axios, { AxiosError } from "axios";
import { useWallet, Transaction } from "../../context/WalletContext"; // Import the Global State

const BACKEND_URL = "http://localhost:5000/api/wallet";

export default function App() {
  // Pull the global state using our custom hook!
  const { walletData, setWalletData } = useWallet();

  const [isDepositing, setIsDepositing] = useState(false);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);

  const handleDeposit = async () => {
    if (!walletData?.user?.id) return;
    setIsDepositing(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/simulate-deposit`, {
        userId: walletData.user.id,
        amount: 5000,
      });

      const newTx: Transaction = {
        id: Date.now().toString(),
        type: "deposit",
        amount: 5000,
        date: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Update Global State
      setWalletData({
        ...walletData,
        user: {
          ...walletData.user,
          trust_score: response.data.new_score,
          balance: response.data.new_balance,
        },
        transactions: [newTx, ...walletData.transactions],
      });
    } catch (error) {
      Alert.alert("Error", "Server issue");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleEmergency = async () => {
    if (!walletData?.user?.id) return;
    setIsEmergencyLoading(true);
    try {
      const billAmount = 20000;
      const response = await axios.post(`${BACKEND_URL}/emergency-payout`, {
        userId: walletData.user.id,
        billAmount: billAmount,
      });

      const newTx: Transaction = {
        id: Date.now().toString(),
        type: "emergency_payout",
        amount: billAmount,
        date: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Update Global State
      setWalletData({
        ...walletData,
        user: {
          ...walletData.user,
          balance: response.data.new_balance,
          trust_score: response.data.new_score,
        },
        transactions: [newTx, ...walletData.transactions],
      });

      Alert.alert("🚨 Hospital Paid", response.data.details);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      Alert.alert("Risk Model Rejection", axiosError.response?.data?.error);
    } finally {
      setIsEmergencyLoading(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isDeposit = item.type === "deposit";
    return (
      <View style={styles.txRow}>
        <View style={styles.txLeft}>
          <View
            style={[
              styles.txIcon,
              { backgroundColor: isDeposit ? "#D1FAE5" : "#FEE2E2" },
            ]}
          >
            <Text style={{ fontSize: 18 }}>{isDeposit ? "↓" : "↑"}</Text>
          </View>
          <View>
            <Text style={styles.txTitle}>
              {isDeposit ? "Wallet Top-up" : "Hospital Payout"}
            </Text>
            <Text style={styles.txDate}>{item.date}</Text>
          </View>
        </View>
        <Text
          style={[
            styles.txAmount,
            { color: isDeposit ? "#10B981" : "#EF4444" },
          ]}
        >
          {isDeposit ? "+" : "-"}₦{item.amount.toLocaleString()}
        </Text>
      </View>
    );
  };

  if (!walletData) return null;

  const isOverdrawn = walletData.user.balance < 0;

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.headerSpacer} />
      <View style={styles.navHeader}>
        <Text style={styles.dashboardTitle}>InstantCare</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                walletData.user.trust_score >= 60 ? "#D1FAE5" : "#FEE2E2",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  walletData.user.trust_score >= 60 ? "#059669" : "#DC2626",
              },
            ]}
          >
            {walletData.user.trust_score >= 60 ? "Credit Active" : "High Risk"}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: "#EEF2FF",
          padding: 10,
          borderRadius: 8,
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            color: "#4F46E5",
            fontSize: 12,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          🤖 Neural Net Assessment:{" "}
          {isOverdrawn
            ? "Debt ratio high. Repay loan to restore score."
            : "Velocity healthy. Keep saving to increase limit."}
        </Text>
      </View>

      <View
        style={[styles.walletCard, isOverdrawn && styles.walletCardOverdrawn]}
      >
        <Text style={styles.cardSub}>
          {isOverdrawn ? "Active Health Loan" : "Available Balance"}
        </Text>
        <Text style={styles.balanceText}>
          {isOverdrawn ? "-" : ""}₦
          {Math.abs(walletData.user.balance).toLocaleString()}.00
        </Text>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardSub}>Virtual Account</Text>
            <Text style={styles.accountNumber}>
              {walletData.user.virtual_account_number}
            </Text>
          </View>
          <View>
            <Text style={styles.cardSub}>Trust Score</Text>
            <Text style={styles.scoreText}>{walletData.user.trust_score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, { flex: 1, marginRight: 10 }]}
          onPress={handleDeposit}
          disabled={isDepositing || isEmergencyLoading}
        >
          {isDepositing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>+ Save ₦5k</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { flex: 1, backgroundColor: "#EF4444" }]}
          onPress={handleEmergency}
          disabled={isEmergencyLoading || isDepositing}
        >
          {isEmergencyLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>🚨 SOS: Pay ₦20k</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {walletData.transactions.length === 0 ? (
        <Text style={styles.emptyText}>No recent transactions.</Text>
      ) : (
        <FlatList
          data={walletData.transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </View>
  );
}

// (Keep your styles exactly the same as they were before)
const styles = StyleSheet.create({
  dashboardContainer: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
  headerSpacer: { height: 50 },
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dashboardTitle: { fontSize: 24, fontWeight: "800", color: "#111827" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },
  walletCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  walletCardOverdrawn: { backgroundColor: "#7F1D1D" },
  cardSub: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 5,
  },
  balanceText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 25,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  accountNumber: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  scoreText: { color: "#3B82F6", fontSize: 24, fontWeight: "800" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 15,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  txLeft: { flexDirection: "row", alignItems: "center" },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  txTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  txDate: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: "700" },
});
