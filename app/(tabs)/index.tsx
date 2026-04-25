import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios, { AxiosError } from "axios";

// ⚠️ CRITICAL: Replace this with your computer's actual IPv4 address
const BACKEND_URL = "http://169.254.208.179:5000/api/wallet";
// Define the shape of the data coming from your Node backend
interface WalletResponse {
  user: {
    first_name: string;
    last_name: string;
    virtual_account_number: string;
    trust_score: number;
  };
}

export default function App() {
  // Pass the interface to useState
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  
  // ... rest of your code
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateWallet = async () => {
    if (!firstName || !lastName || !phoneNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // Making the POST request to your Node.js backend
      const response = await axios.post(`${BACKEND_URL}/create-account`, {
        firstName,
        lastName,
        phoneNumber,
      });

      // If successful, save the data to state to update the UI
      setWalletData(response.data);
      Alert.alert("Success!", "Emergency Wallet Created");
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

  // If wallet is created, show the Dashboard view
  if (walletData) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>InstantCare Dashboard</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Account Name:</Text>
          <Text style={styles.value}>
            {walletData.user.first_name} {walletData.user.last_name}
          </Text>

          <Text style={styles.label}>Squad Virtual Account:</Text>
          <Text style={styles.accountNumber}>
            {walletData.user.virtual_account_number}
          </Text>

          <Text style={styles.label}>Trust Score:</Text>
          <Text style={styles.scoreGauge}>
            {walletData.user.trust_score} / 100
          </Text>
        </View>
      </View>
    );
  }

  // Otherwise, show the Onboarding view
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Join InstantCare</Text>
      <Text style={styles.subHeader}>Emergency Health Financing</Text>

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
        placeholder="Phone Number (e.g., 08012345678)"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateWallet}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Smart Wallet</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7f6",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#e74c3c", // Emergency Red
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 15,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  accountNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#27ae60", // Money Green
    letterSpacing: 2,
    marginTop: 5,
  },
  scoreGauge: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2980b9", // Trust Blue
    marginTop: 5,
  },
});
