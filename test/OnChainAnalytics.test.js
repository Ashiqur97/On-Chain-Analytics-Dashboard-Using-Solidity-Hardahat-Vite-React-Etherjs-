import chai from "chai";
const { expect } = chai;
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("OnChainAnalytics", function () {
  let analytics;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const OnChainAnalytics = await ethers.getContractFactory("OnChainAnalytics");
    analytics = await OnChainAnalytics.deploy();
    await analytics.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await analytics.getAddress()).to.be.properAddress;
    });

    it("Should initialize with zero values", async function () {
      expect(await analytics.totalTransactionsTracked()).to.equal(0);
      expect(await analytics.totalValueTransferred()).to.equal(0);
      expect(await analytics.getTransactionCount()).to.equal(0);
      expect(await analytics.getTrackedAddressCount()).to.equal(0);
    });
  });

  describe("Transaction Recording", function () {
    it("Should record a transaction correctly", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx-1"));
      const value = ethers.parseEther("1.0");

      await expect(analytics.recordTransaction(addr1.address, addr2.address, value, txHash))
        .to.emit(analytics, "TransactionRecorded")
        .withArgs(addr1.address, addr2.address, value, txHash);

      const tx = await analytics.transactions(txHash);
      expect(tx.from).to.equal(addr1.address);
      expect(tx.to).to.equal(addr2.address);
      expect(tx.value).to.equal(value);
      expect(tx.txHash).to.equal(txHash);
    });

    it("Should reject invalid addresses", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx-invalid"));
      const value = ethers.parseEther("1.0");

      await expect(
        analytics.recordTransaction(ethers.ZeroAddress, addr2.address, value, txHash)
      ).to.be.revertedWith("Invalid address: zero address not allowed");

      await expect(
        analytics.recordTransaction(addr1.address, ethers.ZeroAddress, value, txHash)
      ).to.be.revertedWith("Invalid address: zero address not allowed");
    });

    it("Should reject zero value transactions", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx-zero"));
      
      await expect(
        analytics.recordTransaction(addr1.address, addr2.address, 0, txHash)
      ).to.be.revertedWith("Invalid value: must be greater than zero");
    });

    it("Should reject same sender and receiver", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx-same"));
      const value = ethers.parseEther("1.0");

      await expect(
        analytics.recordTransaction(addr1.address, addr1.address, value, txHash)
      ).to.be.revertedWith("Invalid transaction: sender and receiver cannot be the same");
    });

    it("Should reject duplicate transaction hashes", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx-duplicate"));
      const value = ethers.parseEther("1.0");

      await analytics.recordTransaction(addr1.address, addr2.address, value, txHash);
      
      await expect(
        analytics.recordTransaction(addr1.address, addr2.address, value, txHash)
      ).to.be.revertedWith("Transaction already recorded");
    });

    it("Should update address statistics correctly", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx-stats"));
      const value = ethers.parseEther("2.0");

      await analytics.recordTransaction(addr1.address, addr2.address, value, txHash);

      const addr1Stats = await analytics.getAddressAnalytics(addr1.address);
      const addr2Stats = await analytics.getAddressAnalytics(addr2.address);

      expect(addr1Stats.totalTransactions).to.equal(1);
      expect(addr1Stats.totalValue).to.equal(value);
      expect(addr2Stats.totalTransactions).to.equal(1);
      expect(addr2Stats.totalValue).to.equal(0); // Receiver doesn't accumulate value
    });

    it("Should track network statistics", async function () {
      const txHash1 = ethers.keccak256(ethers.toUtf8Bytes("test-tx-net-1"));
      const txHash2 = ethers.keccak256(ethers.toUtf8Bytes("test-tx-net-2"));
      const value = ethers.parseEther("1.0");

      await analytics.recordTransaction(addr1.address, addr2.address, value, txHash1);
      await analytics.recordTransaction(addr2.address, addr3.address, value, txHash2);

      const stats = await analytics.getNetworkStats();
      expect(stats.totalTxs).to.equal(2);
      expect(stats.totalValue).to.equal(value * BigInt(2));
      expect(stats.uniqueAddresses).to.equal(3);
    });
  });

  describe("Data Retrieval", function () {
    beforeEach(async function () {
      // Add test data
      for (let i = 0; i < 5; i++) {
        const txHash = ethers.keccak256(ethers.toUtf8Bytes(`test-tx-${i}`));
        const value = ethers.parseEther((i + 1).toString());
        await analytics.recordTransaction(addr1.address, addr2.address, value, txHash);
      }
    });

    it("Should return recent transactions with correct limit", async function () {
      const recent = await analytics.getRecentTransactions(3);
      expect(recent.length).to.equal(3);
    });

    it("Should handle empty transaction history", async function () {
      const freshAnalytics = await ethers.deployContract("OnChainAnalytics");
      const recent = await freshAnalytics.getRecentTransactions(10);
      expect(recent.length).to.equal(0);
    });

    it("Should return top addresses sorted by value", async function () {
      const [addresses, values] = await analytics.getTopAddresses(10);
      expect(addresses.length).to.be.greaterThan(0);
      expect(values.length).to.equal(addresses.length);
      
      // Check if sorted in descending order
      for (let i = 0; i < values.length - 1; i++) {
        expect(values[i]).to.be.greaterThanOrEqual(values[i + 1]);
      }
    });

    it("Should handle empty address list", async function () {
      const freshAnalytics = await ethers.deployContract("OnChainAnalytics");
      const [addresses, values] = await freshAnalytics.getTopAddresses(10);
      expect(addresses.length).to.equal(0);
      expect(values.length).to.equal(0);
    });

    it("Should reject invalid limits", async function () {
      await expect(analytics.getRecentTransactions(0))
        .to.be.revertedWith("Invalid limit: out of range");
      
      await expect(analytics.getRecentTransactions(101))
        .to.be.revertedWith("Invalid limit: out of range");
      
      await expect(analytics.getTopAddresses(0))
        .to.be.revertedWith("Invalid limit: out of range");
      
      await expect(analytics.getTopAddresses(51))
        .to.be.revertedWith("Invalid limit: out of range");
    });
  });

  describe("Utility Functions", function () {
    it("Should get transaction by hash", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx-hash"));
      const value = ethers.parseEther("1.0");

      await analytics.recordTransaction(addr1.address, addr2.address, value, txHash);
      
      const tx = await analytics.getTransactionByHash(txHash);
      expect(tx.from).to.equal(addr1.address);
      expect(tx.to).to.equal(addr2.address);
      expect(tx.value).to.equal(value);
    });

    it("Should check if transaction is recorded", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx-check"));
      const value = ethers.parseEther("1.0");

      expect(await analytics.isTransactionRecorded(txHash)).to.be.false;
      
      await analytics.recordTransaction(addr1.address, addr2.address, value, txHash);
      
      expect(await analytics.isTransactionRecorded(txHash)).to.be.true;
    });

    it("Should get address by index", async function () {
      const txHash = ethers.keccak256(ethers.toUtf8Bytes("test-tx-index"));
      const value = ethers.parseEther("1.0");

      await analytics.recordTransaction(addr1.address, addr2.address, value, txHash);
      
      expect(await analytics.getAddressByIndex(0)).to.equal(addr1.address);
      expect(await analytics.getAddressByIndex(1)).to.equal(addr2.address);
    });
  });

  describe("Gas Optimization", function () {
    it("Should handle large number of transactions efficiently", async function () {
      const numTxs = 50;
      
      for (let i = 0; i < numTxs; i++) {
        const txHash = ethers.keccak256(ethers.toUtf8Bytes(`bulk-tx-${i}`));
        const value = ethers.parseEther("0.1");
        await analytics.recordTransaction(addr1.address, addr2.address, value, txHash);
      }
      
      const stats = await analytics.getNetworkStats();
      expect(stats.totalTxs).to.equal(numTxs);
      
      const recent = await analytics.getRecentTransactions(10);
      expect(recent.length).to.equal(10);
    });
  });
});