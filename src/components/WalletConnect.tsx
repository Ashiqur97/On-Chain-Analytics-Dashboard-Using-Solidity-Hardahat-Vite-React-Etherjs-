import React from 'react';
import { Wallet, LogOut } from 'lucide-react';

interface WalletConnectProps {
  isConnected: boolean;
  account: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  account,
  onConnect,
  onDisconnect
}) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-4">
      {!isConnected ? (
        <button
          onClick={onConnect}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Wallet size={20} />
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300 font-mono text-sm">
                {formatAddress(account)}
              </span>
            </div>
          </div>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors duration-200"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
};