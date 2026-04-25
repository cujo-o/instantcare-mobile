import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios, { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { useWallet, Transaction } from "../../context/WalletContext"; // Import Global State

const BACKEND_URL = "http://localhost:5000/api/wallet";

const CLINICS = [
  {
    id: "1",
    name: "Minna General Hospital",
    distance: "2.4 km",
    type: "Public",
    emergencyFee: 15000,
  },
  {
    id: "2",
    name: "FMC Specialist Clinic",
    distance: "5.1 km",
    type: "Private",
    emergencyFee: 25000,
  },
  {
    id: "3",
    name: "St. Mary's Care",
    distance: "7.8 km",
    type: "Private",
    emergencyFee: 20000,
  },
];

export default function Explore() {
  const router = useRouter();
  const { walletData, setWalletData } = useWallet(); // Access global state
  const [loadingClinic, setLoadingClinic] = useState<string | null>(null);

  const dispatchEmergencyFunds = async (clinicName: string, fee: number) => {
    if (!walletData?.user?.id) return;

    setLoadingClinic(clinicName);
    try {
      const response = await axios.post(`${BACKEND_URL}/emergency-payout`, {
        userId: walletData.user.id,
        billAmount: fee,
      });

      const newTx: Transaction = {
        id: Date.now().toString(),
        type: "emergency_payout",
        amount: fee,
        date: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setWalletData({
        ...walletData,
        user: {
          ...walletData.user,
          balance: response.data.new_balance,
          trust_score: response.data.new_score,
        },
        transactions: [newTx, ...walletData.transactions],
      });

      // WEB-SAFE SUCCESS POPUP
      if (Platform.OS === "web") {
        window.alert(
          `🚨 Dispatch Successful\n\n₦${fee.toLocaleString()} has been routed to ${clinicName}.`,
        );
        router.push("/");
      } else {
        Alert.alert(
          "🚨 Dispatch Successful",
          `₦${fee.toLocaleString()} has been routed to ${clinicName}.`,
          [{ text: "View Wallet", onPress: () => router.push("/") }],
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMsg = axiosError.response?.data?.error || "Credit denied.";

      if (Platform.OS === "web") {
        window.alert(`Risk Model Rejection:\n\n${errorMsg}`);
      } else {
        Alert.alert("Risk Model Rejection", errorMsg);
      }
    } finally {
      setLoadingClinic(null);
    }
  };

  const confirmDispatch = (clinicName: string, fee: number) => {
    // WEB-SAFE CONFIRMATION POPUP
    if (Platform.OS === "web") {
      const isConfirmed = window.confirm(
        `Confirm Emergency Dispatch\n\nAre you arriving at ${clinicName}? We will instantly route ₦${fee.toLocaleString()} to their front desk.`,
      );
      if (isConfirmed) {
        dispatchEmergencyFunds(clinicName, fee);
      }
    } else {
      Alert.alert(
        "Confirm Emergency Dispatch",
        `Are you arriving at ${clinicName}? We will instantly route ₦${fee.toLocaleString()} to their front desk.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, Route Funds",
            style: "destructive",
            onPress: () => dispatchEmergencyFunds(clinicName, fee),
          },
        ],
      );
    }
  };

  const renderClinic = ({ item }: { item: (typeof CLINICS)[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.clinicName}>{item.name}</Text>
        <Text style={styles.distanceBadge}>{item.distance}</Text>
      </View>
      <Text style={styles.clinicType}>{item.type} Facility</Text>
      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Est. Emergency Deposit:</Text>
        <Text style={styles.feeValue}>
          ₦{item.emergencyFee.toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.actionButton,
          loadingClinic === item.name && styles.actionButtonDisabled,
        ]}
        onPress={() => confirmDispatch(item.name, item.emergencyFee)}
        disabled={loadingClinic !== null}
      >
        {loadingClinic === item.name ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.actionText}>Route Funds Here</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Respondr Network</Text>
      <Text style={styles.subText}>Verified emergency clinics near you</Text>
      <FlatList
        data={CLINICS}
        keyExtractor={(item) => item.id}
        renderItem={renderClinic}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// (Keep styles the same as the previous response)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#111827" },
  subText: { fontSize: 15, color: "#6B7280", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  clinicName: { fontSize: 18, fontWeight: "700", color: "#1F2937", flex: 1 },
  distanceBadge: {
    backgroundColor: "#EEF2FF",
    color: "#4F46E5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },
  clinicType: { fontSize: 14, color: "#9CA3AF", marginBottom: 15 },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  feeLabel: { fontSize: 13, color: "#4B5563" },
  feeValue: { fontSize: 15, fontWeight: "700", color: "#111827" },
  actionButton: {
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonDisabled: { backgroundColor: "#FCA5A5" },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
