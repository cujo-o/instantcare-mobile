import { Tabs } from 'expo-router';
import { WalletProvider } from '../../context/WalletContext';

export default function TabLayout() {
  return (
    <WalletProvider>
      <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#10B981' }}>
        <Tabs.Screen
          name="index"
          options={{ title: 'Wallet' }}
        />
        <Tabs.Screen
          name="explore"
          options={{ title: 'Clinics' }}
        />
      </Tabs>
    </WalletProvider>
  );
}