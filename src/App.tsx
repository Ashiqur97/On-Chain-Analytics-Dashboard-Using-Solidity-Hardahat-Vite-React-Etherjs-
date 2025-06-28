import React from 'react';
import { BarChart3, Database, Zap } from 'lucide-react';
import { WalletConnect } from './components/WalletConnect';
import { NetworkStats } from './components/NetworkStats';
import { TransactionList } from './components/TransactionList';
import { TopAddresses } from './components/TopAddresses';
import { AnalyticsChart } from './components/AnalyticsChart';
import { AddressAnalyzer } from './components/AddressAnalyzer';
import { TransactionRecorder } from './components/TransactionRecorder';
import { useContract } from './hooks/useContract';
import { useAnalytics } from './hooks/useAnalytics';

function App() {
  const { isConnected, account, connectWallet, disconnectWallet, contract } = useContract();
  const { 
    networkStats, 
    recentTransactions, 
    topAddresses, 
    loading, 
    error,
    getAddressAnalytics,
    recordTransaction 
  } = useAnalytics(contract);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800/50 backdrop-blur-sm bg-gray-900/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">ChainAnalytics</h1>
                  <p className="text-sm text-gray-400">On-Chain Data Analysis Dashboard</p>
                </div>
              </div>
              <WalletConnect
                isConnected={isConnected}
                account={account}
                onConnect={connectWallet}
                onDisconnect={disconnectWallet}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-4 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl bg-gray-900/80" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
          {!isConnected ? (
            <div className="text-center py-20">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Database size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Welcome to ChainAnalytics
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  A powerful on-chain analysis dashboard built with Hardhat, Solidity, and React. 
                  Connect your wallet to start analyzing blockchain data and recording transactions.
                </p>
              </div>
              <div className="flex items-center justify-center gap-8 text-gray-400">
                <div className="flex items-center gap-2">
                  <Zap size={20} />
                  <span>Real-time Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database size={20} />
                  <span>Smart Contract Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} />
                  <span>Data Visualization</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Error Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Network Statistics */}
              <NetworkStats stats={networkStats} loading={loading} />

              {isConnected && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 space-y-8">
                      <NetworkStats stats={networkStats} loading={loading} />
                      <TransactionList transactions={recentTransactions} loading={loading} />
                    </div>
                    <div className="space-y-8">
                      <AddressAnalyzer onAnalyze={getAddressAnalytics} />
                      <TransactionRecorder onRecord={recordTransaction} />
                    </div>
                  </div>
                  {/* Chart for Top Addresses */}
                  <AnalyticsChart addresses={topAddresses} />
                  <TopAddresses addresses={topAddresses} loading={loading} />
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;