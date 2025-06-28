import React from 'react';
import { Crown, TrendingUp, Copy } from 'lucide-react';
import { ethers } from 'ethers';

interface TopAddressesProps {
  addresses: { address: string; value: bigint }[];
  loading: boolean;
}

export const TopAddresses: React.FC<TopAddressesProps> = ({ addresses, loading }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatValue = (value: bigint) => {
    const etherValue = ethers.formatEther(value);
    const num = parseFloat(etherValue);
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K ETH`;
    }
    return `${num.toFixed(4)} ETH`;
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown size={16} className="text-yellow-500" />;
      case 1:
        return <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>;
      case 2:
        return <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>;
      default:
        return <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{index + 1}</div>;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Top Addresses</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                  <div className="w-32 h-4 bg-gray-600 rounded"></div>
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
        <h3 className="text-xl font-semibold text-white">Top Addresses</h3>
        <div className="flex items-center gap-2 text-gray-400">
          <TrendingUp size={16} />
          <span className="text-sm">by volume</span>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={24} className="text-gray-500" />
          </div>
          <p className="text-gray-400">No address data available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr, index) => (
            <div
              key={addr.address}
              className="flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                {getRankIcon(index)}
                <span className="font-mono text-sm text-gray-300">
                  {formatAddress(addr.address)}
                </span>
                <button
                  onClick={() => copyToClipboard(addr.address)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Copy size={14} className="text-gray-400 hover:text-white" />
                </button>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{formatValue(addr.value)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};