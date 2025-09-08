import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import AppShell from './components/AppShell';
import Dashboard from './components/Dashboard';
import SubscriptionManager from './components/SubscriptionManager';
import PaymentReminders from './components/PaymentReminders';
import Analytics from './components/Analytics';
import { mockUpcomingPayments } from './data/mockData';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isPremium, setIsPremium] = useState(false);
  const { address: walletAddress } = useAccount();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard isPremium={isPremium} setIsPremium={setIsPremium} />;
      case 'subscriptions':
        return <SubscriptionManager walletAddress={walletAddress} isPremium={isPremium} />;
      case 'reminders':
        return <PaymentReminders walletAddress={walletAddress} upcomingPayments={mockUpcomingPayments} />;
      case 'analytics':
        return <Analytics walletAddress={walletAddress} isPremium={isPremium} />;
      default:
        return <Dashboard isPremium={isPremium} setIsPremium={setIsPremium} />;
    }
  };

  return (
    <AppShell activeView={activeView} setActiveView={setActiveView}>
      {renderActiveView()}
    </AppShell>
  );
}

export default App;
