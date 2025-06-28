import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useContract = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeProvider = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Check if already connected
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            setSigner(signer);
            setAccount(accounts[0].address);
            setIsConnected(true);
            await loadContract(signer);
          }
        } catch (error) {
          console.error('Error initializing provider:', error);
        }
      }
    };

    initializeProvider();
  }, []);

  const loadContract = async (signer: ethers.JsonRpcSigner) => {
    try {
      // Import contract artifacts
      const contractAddress = await import('../contracts/contract-address.json');
      const contractABI = await import('../contracts/OnChainAnalytics.json');
      
      const contract = new ethers.Contract(
        contractAddress.OnChainAnalytics,
        contractABI.abi,
        signer
      );
      
      setContract(contract);
    } catch (error) {
      console.error('Error loading contract:', error);
    }
  };

  const connectWallet = async () => {
    if (!provider) {
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setSigner(signer);
      setAccount(address);
      setIsConnected(true);
      await loadContract(signer);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    setSigner(null);
    setContract(null);
    setAccount('');
    setIsConnected(false);
  };

  return {
    provider,
    signer,
    contract,
    account,
    isConnected,
    connectWallet,
    disconnectWallet
  };
};