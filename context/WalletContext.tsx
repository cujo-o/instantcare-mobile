import React, { createContext, useState, useContext, ReactNode } from "react";

// 1. Define the Global Data Structures
export interface Transaction {
  id: string;
  type: "deposit" | "emergency_payout";
  amount: number;
  date: string;
}

export interface WalletData {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    virtual_account_number: string;
    trust_score: number;
    balance: number;
  };
  transactions: Transaction[];
}

// 2. Define what functions the Context will expose to your app
interface WalletContextType {
  walletData: WalletData | null;
  setWalletData: React.Dispatch<React.SetStateAction<WalletData | null>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// 3. Create the Provider that wraps your app
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  // Initialize the global state with our dummy data
  const [walletData, setWalletData] = useState<WalletData | null>({
    user: {
      id: "89987eb8-ad1c-412b-8d3e-632c1144d8cd", // Keep your backend DB ID here
      first_name: "Ibrahim",
      last_name: "Opeyemi",
      virtual_account_number: "2927589129",
      trust_score: 50,
      balance: 0,
    },
    transactions: [],
  });

  return (
    <WalletContext.Provider value={{ walletData, setWalletData }}>
      {children}
    </WalletContext.Provider>
  );
};

// 4. Create a custom hook for easy access in any file
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
