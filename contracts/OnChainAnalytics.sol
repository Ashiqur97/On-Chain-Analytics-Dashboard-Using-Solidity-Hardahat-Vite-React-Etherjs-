// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OnChainAnalytics {
    struct TransactionData {
        address from;
        address to;
        uint256 value;
        uint256 timestamp;
        bytes32 txHash;
    }
    
    struct AddressAnalytics {
        uint256 totalTransactions;
        uint256 totalValue;
        uint256 firstSeen;
        uint256 lastActive;
        bool isContract;
    }
    
    mapping(address => AddressAnalytics) public addressStats;
    mapping(bytes32 => TransactionData) public transactions;
    
    TransactionData[] public transactionHistory;
    address[] public trackedAddresses;
    
    uint256 public totalTransactionsTracked;
    uint256 public totalValueTransferred;
    
    event TransactionRecorded(
        address indexed from,
        address indexed to,
        uint256 value,
        bytes32 indexed txHash
    );
    
    event AddressAdded(address indexed addr, bool isContract);
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address: zero address not allowed");
        _;
    }
    
    modifier validValue(uint256 value) {
        require(value > 0, "Invalid value: must be greater than zero");
        _;
    }
    
    modifier validLimit(uint256 limit, uint256 maxLimit) {
        require(limit > 0 && limit <= maxLimit, "Invalid limit: out of range");
        _;
    }
    
    function recordTransaction(
        address from,
        address to,
        uint256 value,
        bytes32 txHash
    ) external validAddress(from) validAddress(to) validValue(value) {
        require(from != to, "Invalid transaction: sender and receiver cannot be the same");
        require(transactions[txHash].timestamp == 0, "Transaction already recorded");
        require(txHash != bytes32(0), "Invalid transaction hash");
        
        TransactionData memory newTx = TransactionData({
            from: from,
            to: to,
            value: value,
            timestamp: block.timestamp,
            txHash: txHash
        });
        
        transactions[txHash] = newTx;
        transactionHistory.push(newTx);
        
        _updateAddressStats(from, value, true);
        _updateAddressStats(to, value, false);
        
        totalTransactionsTracked++;
        totalValueTransferred += value;
        
        emit TransactionRecorded(from, to, value, txHash);
    }
    
    function _updateAddressStats(address addr, uint256 value, bool isSender) internal {
        AddressAnalytics storage stats = addressStats[addr];
        
        if (stats.firstSeen == 0) {
            stats.firstSeen = block.timestamp;
            stats.isContract = _isContract(addr);
            trackedAddresses.push(addr);
            emit AddressAdded(addr, stats.isContract);
        }
        
        stats.totalTransactions++;
        stats.lastActive = block.timestamp;
        
        if (isSender) {
            stats.totalValue += value;
        }
    }
    
    function _isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }
    
    function getAddressAnalytics(address addr) external view validAddress(addr) returns (AddressAnalytics memory) {
        return addressStats[addr];
    }
    
    function getRecentTransactions(uint256 limit) external view validLimit(limit, 100) returns (TransactionData[] memory) {
        if (transactionHistory.length == 0) {
            return new TransactionData[](0);
        }
        
        uint256 start = transactionHistory.length > limit ? 
            transactionHistory.length - limit : 0;
        uint256 count = transactionHistory.length - start;
        
        TransactionData[] memory recent = new TransactionData[](count);
        
        for (uint256 i = 0; i < count; i++) {
            recent[i] = transactionHistory[start + i];
        }
        
        return recent;
    }
    
    function getTopAddresses(uint256 limit) external view returns (address[] memory, uint256[] memory) {
        // Always return empty arrays if no tracked addresses or invalid limit
        if (trackedAddresses.length == 0 || limit == 0 || limit > 50) {
            return (new address[](0), new uint256[](0));
        }
        
        uint256 count = trackedAddresses.length > limit ? limit : trackedAddresses.length;
        address[] memory addresses = new address[](count);
        uint256[] memory values = new uint256[](count);
        
        // Create arrays for sorting
        address[] memory tempAddresses = new address[](trackedAddresses.length);
        uint256[] memory tempValues = new uint256[](trackedAddresses.length);
        
        // Copy data to temporary arrays
        for (uint256 i = 0; i < trackedAddresses.length; i++) {
            tempAddresses[i] = trackedAddresses[i];
            tempValues[i] = addressStats[trackedAddresses[i]].totalValue;
        }
        
        // Simple bubble sort for top addresses (descending order)
        for (uint256 i = 0; i < tempAddresses.length - 1; i++) {
            for (uint256 j = 0; j < tempAddresses.length - i - 1; j++) {
                if (tempValues[j] < tempValues[j + 1]) {
                    // Swap values
                    uint256 tempValue = tempValues[j];
                    tempValues[j] = tempValues[j + 1];
                    tempValues[j + 1] = tempValue;
                    
                    // Swap addresses
                    address tempAddr = tempAddresses[j];
                    tempAddresses[j] = tempAddresses[j + 1];
                    tempAddresses[j + 1] = tempAddr;
                }
            }
        }
        
        // Return top addresses
        for (uint256 i = 0; i < count; i++) {
            addresses[i] = tempAddresses[i];
            values[i] = tempValues[i];
        }
        
        return (addresses, values);
    }
    
    function getNetworkStats() external view returns (
        uint256 totalTxs,
        uint256 totalValue,
        uint256 uniqueAddresses,
        uint256 contractAddresses
    ) {
        totalTxs = totalTransactionsTracked;
        totalValue = totalValueTransferred;
        uniqueAddresses = trackedAddresses.length;
        
        uint256 contracts = 0;
        for (uint256 i = 0; i < trackedAddresses.length; i++) {
            if (addressStats[trackedAddresses[i]].isContract) {
                contracts++;
            }
        }
        contractAddresses = contracts;
    }
    
    // Additional utility functions for better functionality
    function getTransactionByHash(bytes32 txHash) external view returns (TransactionData memory) {
        require(transactions[txHash].timestamp != 0, "Transaction not found");
        return transactions[txHash];
    }
    
    function getTransactionCount() external view returns (uint256) {
        return transactionHistory.length;
    }
    
    function getTrackedAddressCount() external view returns (uint256) {
        return trackedAddresses.length;
    }
    
    function isTransactionRecorded(bytes32 txHash) external view returns (bool) {
        return transactions[txHash].timestamp != 0;
    }
    
    function getAddressByIndex(uint256 index) external view returns (address) {
        require(index < trackedAddresses.length, "Index out of bounds");
        return trackedAddresses[index];
    }
}