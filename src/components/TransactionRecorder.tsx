import React, { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { ethers } from 'ethers';

interface TransactionRecorderProps {
  onRecord: (from: string, to: string, value: bigint, txHash: string) => Promise<void>;
}

export const TransactionRecorder: React.FC<TransactionRecorderProps> = ({ onRecord }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!from.trim()) {
      setError('Please enter a "from" address');
      return;
    }
    if (!to.trim()) {
      setError('Please enter a "to" address');
      return;
    }
    if (!ethers.isAddress(from)) {
      setError('Invalid "from" address');
      return;
    }
    if (!ethers.isAddress(to)) {
      setError('Invalid "to" address');
      return;
    }
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      setError('Please enter a valid value amount');
      return;
    }

    setLoading(true);

    try {
      const valueInWei = ethers.parseEther(value);
      const txHash = ethers.keccak256(ethers.toUtf8Bytes(`${from}-${to}-${value}-${Date.now()}`));
      
      await onRecord(from, to, valueInWei, txHash);
      
      setSuccess('Transaction recorded successfully!');
      setFrom('');
      setTo('');
      setValue('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <Plus size={20} className="text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">Record Transaction</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            From Address
          </label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="0x..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            To Address
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Value (ETH)
          </label>
          <input
            type="number"
            step="0.0001"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.0"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-all duration-200"
        >
          <Send size={20} />
          {loading ? 'Recording...' : 'Record Transaction'}
        </button>
      </form>
    </div>
  );
};