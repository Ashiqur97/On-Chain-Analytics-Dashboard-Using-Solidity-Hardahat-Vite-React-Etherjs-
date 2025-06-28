import React from 'react';
import { TrendingUp, Users, Zap, Building } from 'lucide-react';
import { ethers } from 'ethers';

interface NetworkStatsProps {
  stats: {
    totalTxs: bigint;
    totalValue: bigint;
    uniqueAddresses: bigint;
    contractAddresses: bigint;
  } | null;
  loading: boolean;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ stats, loading }) => {
  const formatValue = (value: bigint) => {
    const etherValue = ethers.formatEther(value);
    const num = parseFloat(etherValue);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M ETH`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K ETH`;
    }
    return `${num.toFixed(4)} ETH`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: {
    icon: React.ElementType;
    title: string;
    value: string;
    subtitle: string;
    color: string;
  }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{loading ? '...' : value}</p>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>
      <h3 className="text-gray-300 font-medium">{title}</h3>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={TrendingUp}
        title="Total Transactions"
        value={stats ? stats.totalTxs.toString() : '0'}
        subtitle="Tracked"
        color="bg-gradient-to-br from-blue-500 to-blue-600"
      />
      <StatCard
        icon={Zap}
        title="Total Value"
        value={stats ? formatValue(stats.totalValue) : '0 ETH'}
        subtitle="Transferred"
        color="bg-gradient-to-br from-purple-500 to-purple-600"
      />
      <StatCard
        icon={Users}
        title="Unique Addresses"
        value={stats ? stats.uniqueAddresses.toString() : '0'}
        subtitle="Active"
        color="bg-gradient-to-br from-green-500 to-green-600"
      />
      <StatCard
        icon={Building}
        title="Smart Contracts"
        value={stats ? stats.contractAddresses.toString() : '0'}
        subtitle="Deployed"
        color="bg-gradient-to-br from-orange-500 to-orange-600"
      />
    </div>
  );
};