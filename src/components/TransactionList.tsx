import React from 'react';
import { ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';

interface Transaction {
  from: string;
  to: string;
  value: bigint;
  timestamp: bigint;
  txHash: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, loading }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: bigint) => {
    const etherValue = ethers.formatEther(value);
    return `${parseFloat(etherValue).toFixed(4)} ETH`;
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-600 rounded"></div>
                    <div className="w-16 h-3 bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="w-20 h-4 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={16} />
          <span className="text-sm">Live updates</span>
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRight size={24} className="text-gray-500" />
          </div>
          <p className="text-gray-400">No transactions recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 group"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-mono text-sm text-gray-300">
                    {formatAddress(tx.from)}
                  </span>
                </div>
                <ArrowRight size={16} className="text-gray-500" />
                <span className="font-mono text-sm text-gray-300">
                  {formatAddress(tx.to)}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-white">{formatValue(tx.value)}</p>
                  <p className="text-xs text-gray-400">{formatTime(tx.timestamp)}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ExternalLink size={16} className="text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};