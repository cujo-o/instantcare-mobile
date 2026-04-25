import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import axios, { AxiosError } from "axios";

// Toggle these depending on your testing environment
const BACKEND_URL = "http://localhost:5000/api/wallet";
// const BACKEND_URL = "http://192.168.X.X:5000/api/wallet";

interface WalletResponse {
  user: {
    id: string; 
    first_name: string;
    last_name: string;
    virtual_account_number: string;
    trust_score: number;
    balance: number;
  };
}

export default function App() {
  // Navigation State for the Onboarding Wizard
  const [step, setStep] = useState(1);

  // User Data State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bvn, setBvn] = useState("");
  const [dob, setDob] = useState("");

  // App States
  const [isLoading, setIsLoading] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
 // const [walletData, setWalletData] = useState<WalletResponse | null>(null);

 const [walletData, setWalletData] = useState<WalletResponse | null>({
    user: {
      id: "89987eb8-ad1c-412b-8d3e-632c1144d8cd", // Your Supabase ID
      first_name: "Ibrahim",
      last_name: "Opeyemi",
      virtual_account_number: "2927589129",
      trust_score: 50,
      balance: 0,
    }
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleCreateWallet = async () => {
    if (!bvn || !dob) {
      Alert.alert("Required", "Please complete all KYC fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/create-account`, {
        firstName,
        lastName,
        phoneNumber,
        bvn,
        dob,
        address,
        gender,
      });

      setWalletData(response.data);
      Alert.alert("Success", "Smart Wallet Activated");
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError<{ error: string }>;
      Alert.alert(
        "API Error",
        axiosError.response?.data?.error || "Could not connect to server",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!walletData?.user?.id) return;

    setIsDepositing(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/simulate-deposit`, {
        userId: walletData.user.id,
        amount: 5000,
      });

      // Instantly update the UI with the new Trust Score
     // Instantly update the UI with the new Trust Score AND Balance
      setWalletData({
        ...walletData,
        user: {
          ...walletData.user,
          trust_score: response.data.new_score,
          balance: walletData.user.balance + response.data.amount_deposited 
        }
      });
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError<{ error: string }>;
      Alert.alert(
        "Deposit Failed",
        axiosError.response?.data?.error || "Could not reach server",
      );
    } finally {
      setIsDepositing(false);
    }
  };

  // --- DASHBOARD VIEW ---
  if (walletData) {
    return (
      <View style={styles.dashboardContainer}>
        <View style={styles.headerSpacer} />
        <Text style={styles.dashboardTitle}>InstantCare</Text>

        <View style={styles.walletCard}>
          <Text style={styles.cardSub}>Balance</Text>
          <Text style={styles.balanceText}>
            ₦{walletData.user.balance.toLocaleString()}.00
          </Text>

          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardSub}>Virtual Account (Squad)</Text>
              <Text style={styles.accountNumber}>
                {walletData.user.virtual_account_number}
              </Text>
            </View>
            <View>
              <Text style={styles.cardSub}>Trust Score</Text>
              <Text style={styles.scoreText}>
                {walletData.user.trust_score}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeposit}
          disabled={isDepositing}
        >
          {isDepositing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>+ Quick Save ₦5,000</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // --- ONBOARDING WIZARD VIEW ---
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.wizardHeader}>
          <Text style={styles.header}>InstantCare</Text>
          <Text style={styles.subHeader}>Step {step} of 3</Text>
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(step / 3) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* STEP 1: BASIC INFO */}
        {step === 1 && (
          <View style={styles.formStep}>
            <Text style={styles.stepTitle}>Let's get to know you</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Gender (1=Male, 2=Female)"
              value={gender}
              onChangeText={setGender}
              keyboardType="number-pad"
              maxLength={1}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: CONTACT */}
        {step === 2 && (
          <View style={styles.formStep}>
            <Text style={styles.stepTitle}>How can we reach you?</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Residential Address"
              value={address}
              onChangeText={setAddress}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBack}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1, marginLeft: 10 }]}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: KYC */}
        {step === 3 && (
          <View style={styles.formStep}>
            <Text style={styles.stepTitle}>Verify your identity</Text>
            <Text style={styles.kycNotice}>
              Required by CBN to generate your wallet.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="11-Digit BVN"
              value={bvn}
              onChangeText={setBvn}
              keyboardType="number-pad"
              maxLength={11}
            />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (MM/DD/YYYY)"
              value={dob}
              onChangeText={setDob}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBack}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1, marginLeft: 10 }]}
                onPress={handleCreateWallet}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Wallet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: "center" },

  // Wizard Typography & Progress
  wizardHeader: { marginBottom: 30, alignItems: "center" },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 15,
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 3,
  },

  // Forms
  formStep: { width: "100%" },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  kycNotice: {
    fontSize: 13,
    color: "#059669",
    backgroundColor: "#D1FAE5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#111827",
  },

  // Buttons
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 100,
  },
  secondaryButtonText: { color: "#4B5563", fontSize: 16, fontWeight: "600" },

  // Dashboard Styles
  dashboardContainer: { flex: 1, backgroundColor: "#F3F4F6", padding: 24 },
  headerSpacer: { height: 60 },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
  },
  walletCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 25,
  },
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
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  scoreText: { color: "#3B82F6", fontSize: 24, fontWeight: "800" },

  actionButton: {
    backgroundColor: "#10B981",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
