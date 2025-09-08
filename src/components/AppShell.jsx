import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bell, Menu, Settings } from 'lucide-react';

const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">P</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">PayNoti</h1>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-4">
                <a href="#" className="text-white/80 hover:text-white transition-colors">Dashboard</a>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Payments</a>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Subscriptions</a>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-white/80 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/80 hover:text-white transition-colors md:hidden">
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
};

export default AppShell;