'use client';

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  apy: number;
  risk: string;
  minAmount: number;
  maxAmount: number;
  duration: number;
}

const strategies: Strategy[] = [
  {
    id: '1',
    name: 'Conservative LP Strategy',
    description: 'Low-risk liquidity provision with stable pairs',
    apy: 8.5,
    risk: 'Low',
    minAmount: 100,
    maxAmount: 10000,
    duration: 30
  },
  {
    id: '2',
    name: 'Balanced Yield Strategy',
    description: 'Mix of lending and liquidity provision',
    apy: 15.2,
    risk: 'Medium',
    minAmount: 500,
    maxAmount: 50000,
    duration: 60
  },
  {
    id: '3',
    name: 'Aggressive Farming',
    description: 'High-risk, high-reward farming with new protocols',
    apy: 28.7,
    risk: 'High',
    minAmount: 1000,
    maxAmount: 100000,
    duration: 90
  }
];

export const FarmingStrategy: FC = () => {
  const { publicKey } = useWallet();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);
  const [autoCompound, setAutoCompound] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy);

  const calculateProjectedEarnings = () => {
    if (!selectedStrategyData || amount <= 0) return 0;
    const dailyRate = selectedStrategyData.apy / 365 / 100;
    const totalDays = duration;
    return amount * Math.pow(1 + dailyRate, totalDays) - amount;
  };

  const handleStartFarming = async () => {
    if (!selectedStrategy || amount <= 0) {
      alert('Please select a strategy and enter a valid amount');
      return;
    }
    
    setLoading(true);
    try {
      // Simulate farming start with more realistic steps
      console.log('🚀 Starting farming strategy:', selectedStrategyData?.name);
      console.log('💰 Amount:', amount, 'USDC');
      console.log('📅 Duration:', duration, 'days');
      
      // Step 1: Validate inputs
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ Input validation complete');
      
      // Step 2: Check wallet connection
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ Wallet connection verified');
      
      // Step 3: Simulate transaction building
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Transaction built');
      
      // Step 4: Simulate transaction signing
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Transaction signed');
      
      // Step 5: Simulate transaction submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Transaction submitted to network');
      
      // Success!
      const successMsg = `🎉 Farming strategy started successfully!
      
Strategy: ${selectedStrategyData?.name}
Amount: ${amount} USDC
Duration: ${duration} days
APY: ${selectedStrategyData?.apy}%
Auto-compound: ${autoCompound ? 'Enabled' : 'Disabled'}

Your farming position is now active! You can monitor your earnings in the dashboard.`;
      
      setSuccessMessage(successMsg);
      setSuccess(true);
      
      // Reset form
      setSelectedStrategy('');
      setAmount(0);
      setDuration(30);
      setAutoCompound(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('❌ Error starting farming:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to start farming strategy: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Farming Strategy</h2>
      
      {/* Strategy Selection */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Strategy</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-full">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all min-w-0 ${
                selectedStrategy === strategy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedStrategy(strategy.id)}
            >
              <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{strategy.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{strategy.description}</p>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                <span className="text-green-600 font-bold text-sm sm:text-base">{strategy.apy}% APY</span>
                <span className={`px-2 py-1 rounded text-xs font-medium self-start whitespace-nowrap ${
                  strategy.risk === 'Low' ? 'bg-green-100 text-green-800' :
                  strategy.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {strategy.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedStrategy && (
        <>
          {/* Configuration */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USDC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={selectedStrategyData?.minAmount || 0}
                max={selectedStrategyData?.maxAmount || 100000}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="Enter amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: ${selectedStrategyData?.minAmount} | Max: ${selectedStrategyData?.maxAmount}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={7}
                max={365}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoCompound"
                checked={autoCompound}
                onChange={(e) => setAutoCompound(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoCompound" className="ml-2 block text-sm text-gray-700">
                Auto-compound rewards
              </label>
            </div>
          </div>

          {/* Projected Earnings */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Projected Earnings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Earnings</p>
                <p className="text-base sm:text-lg font-bold text-green-600">
                  ${calculateProjectedEarnings().toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Value</p>
                <p className="text-base sm:text-lg font-bold text-gray-800">
                  ${(amount + calculateProjectedEarnings()).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartFarming}
            disabled={loading || amount <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition-colors text-sm sm:text-base"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                Starting Strategy...
              </div>
            ) : (
              'Start Farming Strategy'
            )}
          </button>

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800 whitespace-pre-line">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}; 