export interface TransactionData {
  from: string;
  to: string;
  value: bigint;
  timestamp: bigint;
  txHash: string;
}

export interface AddressAnalytics {
  totalTransactions: bigint;
  totalValue: bigint;
  firstSeen: bigint;
  lastActive: bigint;
  isContract: boolean;
}

export interface NetworkStats {
  totalTxs: bigint;
  totalValue: bigint;
  uniqueAddresses: bigint;
  contractAddresses: bigint;
}

export interface ContractEvents {
  TransactionRecorded: {
    from: string;
    to: string;
    value: bigint;
    txHash: string;
  };
  AddressAdded: {
    addr: string;
    isContract: boolean;
  };
}