import React, { useState } from 'react';
import { Search, User, Activity, Clock, Shield } from 'lucide-react';
import { ethers } from 'ethers';

interface AddressAnalytics {
  totalTransactions: bigint;
  totalValue: bigint;
  firstSeen: bigint;
  lastActive: bigint;
  isContract: boolean;
}

interface AddressAnalyzerProps {
  onAnalyze: (address: string) => Promise<AddressAnalytics | null>;
}

export const AddressAnalyzer: React.FC<AddressAnalyzerProps> = ({ onAnalyze }) => {
  const [address, setAddress] = useState('');
  const [analytics, setAnalytics] = useState<AddressAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    if (!ethers.isAddress(address)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await onAnalyze(address);
      setAnalytics(result);
      if (!result) {
        setError('No data found for this address');
      }
    } catch (err) {
      setError('Failed to analyze address');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const formatValue = (value: bigint) => {
    try {
      const etherValue = ethers.formatEther(value);
      return `${parseFloat(etherValue).toFixed(4)} ETH`;
    } catch {
      return '0.0000 ETH';
    }
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return 'Never';
    try {
      const date = new Date(Number(timestamp) * 1000);
      return date.toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Address Analyzer</h3>
      
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Ethereum address (0x...)"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-200"
          >
            <Search size={20} />
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {analytics && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="text-blue-400" size={20} />
                <span className="text-gray-300 font-medium">Transaction Count</span>
              </div>
              <p className="text-2xl font-bold text-white">{analytics.totalTransactions.toString()}</p>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="text-purple-400" size={20} />
                <span className="text-gray-300 font-medium">Total Volume</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatValue(analytics.totalValue)}</p>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-green-400" size={20} />
                <span className="text-gray-300 font-medium">First Seen</span>
              </div>
              <p className="text-lg font-semibold text-white">{formatDate(analytics.firstSeen)}</p>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-orange-400" size={20} />
                <span className="text-gray-300 font-medium">Account Type</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {analytics.isContract ? 'Smart Contract' : 'EOA (Wallet)'}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-blue-400" size={20} />
              <span className="text-gray-300 font-medium">Last Active</span>
            </div>
            <p className="text-lg font-semibold text-white">{formatDate(analytics.lastActive)}</p>
          </div>
        </div>
      )}
    </div>
  );
};