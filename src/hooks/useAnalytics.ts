import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface NetworkStats {
  totalTxs: bigint;
  totalValue: bigint;
  uniqueAddresses: bigint;
  contractAddresses: bigint;
}

interface TransactionData {
  from: string;
  to: string;
  value: bigint;
  timestamp: bigint;
  txHash: string;
}

interface AddressAnalytics {
  totalTransactions: bigint;
  totalValue: bigint;
  firstSeen: bigint;
  lastActive: bigint;
  isContract: boolean;
}

export const useAnalytics = (contract: ethers.Contract | null) => {
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [topAddresses, setTopAddresses] = useState<{ address: string; value: bigint }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkStats = useCallback(async () => {
    if (!contract) {
      setNetworkStats(null);
      setError('Contract not connected');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const stats = await contract.getNetworkStats();
      setNetworkStats({
        totalTxs: stats.totalTxs,
        totalValue: stats.totalValue,
        uniqueAddresses: stats.uniqueAddresses,
        contractAddresses: stats.contractAddresses
      });
    } catch (err: any) {
      // Defensive: always set to empty/defaults on error
      setNetworkStats(null);
      if (err.code === 'CALL_EXCEPTION' || err.message?.includes('missing revert data')) {
        setError('No network stats available yet (contract may be empty or not deployed)');
      } else {
        setError('Failed to fetch network stats');
      }
      console.error('Failed to fetch network stats:', err);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const fetchRecentTransactions = useCallback(async (limit: number = 10) => {
    if (!contract) return;

    try {
      const transactions = await contract.getRecentTransactions(limit);
      setRecentTransactions(transactions);
    } catch (err) {
      console.error('Failed to fetch recent transactions:', err);
      // Don't set error for this as it might be empty initially
    }
  }, [contract]);

  const fetchTopAddresses = useCallback(async (limit: number = 10) => {
    if (!contract) return;
    // Ensure limit is always between 1 and 50
    if (typeof limit !== "number" || limit < 1 || limit > 50) {
      limit = 10;
    }
    try {
      const result = await contract.getTopAddresses(limit);
      const [addresses, values] = result;
      
      // Handle empty results
      if (!addresses || addresses.length === 0) {
        setTopAddresses([]);
        return;
      }
      
      const topAddrs = addresses.map((addr: string, index: number) => ({
        address: addr,
        value: values[index] || BigInt(0)
      }));
      setTopAddresses(topAddrs);
    } catch (err: any) {
      // If the contract call fails (e.g., empty contract, revert), just show empty list
      if (err.code === 'CALL_EXCEPTION' || err.message?.includes('missing revert data')) {
        setTopAddresses([]);
        return;
      }
      console.error('Failed to fetch top addresses:', err);
      setTopAddresses([]);
    }
  }, [contract]);

  const getAddressAnalytics = useCallback(async (address: string): Promise<AddressAnalytics | null> => {
    if (!contract) return null;

    try {
      const analytics = await contract.getAddressAnalytics(address);
      return {
        totalTransactions: analytics.totalTransactions,
        totalValue: analytics.totalValue,
        firstSeen: analytics.firstSeen,
        lastActive: analytics.lastActive,
        isContract: analytics.isContract
      };
    } catch (err) {
      console.error('Failed to fetch address analytics:', err);
      throw new Error('Failed to analyze address');
    }
  }, [contract]);

  const recordTransaction = useCallback(async (
    from: string,
    to: string,
    value: bigint,
    txHash: string
  ) => {
    if (!contract) throw new Error('Contract not connected');

    // Log all parameters before sending
    console.log('[recordTransaction] Params:', {
      from,
      to,
      value: value.toString(),
      txHash
    });

    try {
      const tx = await contract.recordTransaction(from, to, value, txHash);
      await tx.wait();
      
      // Refresh data after recording
      await Promise.all([
        fetchNetworkStats(),
        fetchRecentTransactions(),
        fetchTopAddresses()
      ]);
    } catch (err: any) {
      // Print full error details
      console.error('Failed to record transaction:', err);
      if (err?.error?.data?.message) {
        console.error('Revert reason:', err.error.data.message);
      } else if (err?.data?.message) {
        console.error('Revert reason:', err.data.message);
      } else if (err?.reason) {
        console.error('Revert reason:', err.reason);
      }
      throw new Error('Failed to record transaction');
    }
  }, [contract, fetchNetworkStats, fetchRecentTransactions, fetchTopAddresses]);

  useEffect(() => {
    if (contract) {
      // Initial data fetch
      Promise.all([
        fetchNetworkStats(),
        fetchRecentTransactions(),
        fetchTopAddresses()
      ]);

      // Set up event listeners
      const handleTransactionRecorded = () => {
        Promise.all([
          fetchNetworkStats(),
          fetchRecentTransactions(),
          fetchTopAddresses()
        ]);
      };

      try {
        contract.on('TransactionRecorded', handleTransactionRecorded);
      } catch (err) {
        console.error('Failed to set up event listener:', err);
      }

      return () => {
        try {
          contract.off('TransactionRecorded', handleTransactionRecorded);
        } catch (err) {
          console.error('Failed to remove event listener:', err);
        }
      };
    }
  }, [contract, fetchNetworkStats, fetchRecentTransactions, fetchTopAddresses]);

  return {
    networkStats,
    recentTransactions,
    topAddresses,
    loading,
    error,
    getAddressAnalytics,
    recordTransaction,
    refreshData: () => {
      if (contract) {
        Promise.all([
          fetchNetworkStats(),
          fetchRecentTransactions(),
          fetchTopAddresses()
        ]);
      }
    }
  };
};