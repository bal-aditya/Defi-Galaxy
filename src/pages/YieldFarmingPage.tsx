import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Coins
} from 'lucide-react'

interface FarmingOpportunity {
  id: string
  name: string
  protocol: string
  apy: number
  tvl: number
  risk: 'low' | 'medium' | 'high'
  tokens: string[]
  description: string
  minAmount: number
  maxAmount: number
}

interface Strategy {
  id: string
  name: string
  description: string
  apy: number
  risk: string
  minAmount: number
  maxAmount: number
  duration: number
  icon: React.ReactNode
}

const mockOpportunities: FarmingOpportunity[] = [
  {
    id: '1',
    name: 'SOL-USDC LP',
    protocol: 'Raydium',
    apy: 12.5,
    tvl: 1500000,
    risk: 'low',
    tokens: ['SOL', 'USDC'],
    description: 'Liquidity provision for SOL-USDC pair on Raydium',
    minAmount: 100,
    maxAmount: 10000
  },
  {
    id: '2',
    name: 'JUP-USDC LP',
    protocol: 'Orca',
    apy: 18.2,
    tvl: 850000,
    risk: 'medium',
    tokens: ['JUP', 'USDC'],
    description: 'Liquidity provision for JUP-USDC pair on Orca',
    minAmount: 500,
    maxAmount: 50000
  },
  {
    id: '3',
    name: 'BONK-SOL LP',
    protocol: 'Raydium',
    apy: 25.8,
    tvl: 320000,
    risk: 'high',
    tokens: ['BONK', 'SOL'],
    description: 'Liquidity provision for BONK-SOL pair on Raydium',
    minAmount: 1000,
    maxAmount: 100000
  },
  {
    id: '4',
    name: 'USDC Lending',
    protocol: 'Solend',
    apy: 8.3,
    tvl: 2500000,
    risk: 'low',
    tokens: ['USDC'],
    description: 'Lend USDC on Solend protocol',
    minAmount: 50,
    maxAmount: 50000
  },
  {
    id: '5',
    name: 'SOL Staking',
    protocol: 'Marinade',
    apy: 6.8,
    tvl: 5000000,
    risk: 'low',
    tokens: ['SOL'],
    description: 'Stake SOL through Marinade Finance',
    minAmount: 1,
    maxAmount: 1000
  }
]

const strategies: Strategy[] = [
  {
    id: '1',
    name: 'Conservative LP Strategy',
    description: 'Low-risk liquidity provision with stable pairs',
    apy: 8.5,
    risk: 'Low',
    minAmount: 100,
    maxAmount: 10000,
    duration: 30,
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: '2',
    name: 'Balanced Yield Strategy',
    description: 'Mix of lending and liquidity provision',
    apy: 15.2,
    risk: 'Medium',
    minAmount: 500,
    maxAmount: 50000,
    duration: 60,
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: '3',
    name: 'Aggressive Farming',
    description: 'High-risk, high-reward farming with new protocols',
    apy: 28.7,
    risk: 'High',
    minAmount: 1000,
    maxAmount: 100000,
    duration: 90,
    icon: <Zap className="h-5 w-5" />
  }
]

export const YieldFarmingPage: React.FC = () => {
  const { connected, publicKey } = useWallet()
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('apy')
  const [selectedStrategy, setSelectedStrategy] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [duration, setDuration] = useState<number>(30)
  const [autoCompound, setAutoCompound] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy)

  const filteredOpportunities = mockOpportunities
    .filter(opp => selectedRisk === 'all' || opp.risk === selectedRisk)
    .sort((a, b) => {
      switch (sortBy) {
        case 'apy':
          return b.apy - a.apy
        case 'tvl':
          return b.tvl - a.tvl
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const calculateProjectedEarnings = () => {
    if (!selectedStrategyData || amount <= 0) return 0
    const dailyRate = selectedStrategyData.apy / 365 / 100
    const totalDays = duration
    return amount * Math.pow(1 + dailyRate, totalDays) - amount
  }

  const handleStartFarming = async () => {
    if (!selectedStrategy || amount <= 0) {
      alert('Please select a strategy and enter a valid amount')
      return
    }
    
    setLoading(true)
    try {
      // Simulate farming start
      console.log('🚀 Starting farming strategy:', selectedStrategyData?.name)
      console.log('💰 Amount:', amount, 'USDC')
      console.log('📅 Duration:', duration, 'days')
      
      // Simulate transaction steps
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('✅ Input validation complete')
      
      if (!publicKey) {
        throw new Error('Wallet not connected')
      }
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('✅ Wallet connection verified')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('✅ Transaction built')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('✅ Transaction signed')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('✅ Transaction submitted to network')
      
      const successMsg = `🎉 Farming strategy started successfully!
      
Strategy: ${selectedStrategyData?.name}
Amount: ${amount} USDC
Duration: ${duration} days
APY: ${selectedStrategyData?.apy}%
Auto-compound: ${autoCompound ? 'Enabled' : 'Disabled'}

Your farming position is now active! You can monitor your earnings in the dashboard.`
      
      setSuccessMessage(successMsg)
      setSuccess(true)
      
      // Reset form
      setSelectedStrategy('')
      setAmount(0)
      setDuration(30)
      setAutoCompound(true)
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
        setSuccessMessage('')
      }, 5000)
      
    } catch (error) {
      console.error('❌ Error starting farming:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to start farming strategy: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-jupiter-primary" />
              Yield Farming
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Maximize your DeFi returns with automated yield farming strategies</p>
          </div>
          {!connected && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Connect wallet to start farming</span>
              <WalletMultiButton />
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-400">Farming Strategy Started!</h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300 whitespace-pre-line">{successMessage}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Strategy & Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Farming Strategy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-jupiter-primary" />
              Farming Strategy
            </h2>
            
            {/* Strategy Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Strategy</label>
              <div className="space-y-3">
                {strategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedStrategy === strategy.id
                        ? 'border-jupiter-primary bg-jupiter-primary/5 dark:bg-jupiter-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedStrategy(strategy.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-jupiter-primary">{strategy.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{strategy.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{strategy.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-green-600 dark:text-green-400 font-semibold">{strategy.apy}% APY</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            strategy.risk === 'Low' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                            strategy.risk === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          }`}>
                            {strategy.risk}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedStrategy && (
              <>
                {/* Configuration */}
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount (USDC)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={selectedStrategyData?.minAmount || 0}
                      max={selectedStrategyData?.maxAmount || 100000}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jupiter-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter amount"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Min: ${selectedStrategyData?.minAmount} | Max: ${selectedStrategyData?.maxAmount}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      min={7}
                      max={365}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jupiter-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoCompound"
                      checked={autoCompound}
                      onChange={(e) => setAutoCompound(e.target.checked)}
                      className="h-4 w-4 text-jupiter-primary focus:ring-jupiter-primary border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <label htmlFor="autoCompound" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Auto-compound rewards
                    </label>
                  </div>
                </div>

                {/* Projected Earnings */}
                {amount > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Projected Earnings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Return:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${calculateProjectedEarnings().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Final Amount:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${(amount + calculateProjectedEarnings()).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Start Farming Button */}
                <button
                  onClick={handleStartFarming}
                  disabled={!connected || loading}
                  className="w-full bg-jupiter-primary hover:bg-jupiter-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Starting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Start Farming
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-jupiter-primary" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total TVL:</span>
                <span className="font-semibold text-gray-900 dark:text-white">$10.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg APY:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">14.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Users:</span>
                <span className="font-semibold text-gray-900 dark:text-white">1,247</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Opportunities */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yield Farming Opportunities</h2>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Level</label>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jupiter-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Risks</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jupiter-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="apy">APY (High to Low)</option>
                  <option value="tvl">TVL (High to Low)</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Opportunities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{opportunity.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{opportunity.protocol}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      opportunity.risk === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                      opportunity.risk === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {opportunity.risk.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">APY:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{opportunity.apy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">TVL:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${(opportunity.tvl / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Tokens:</p>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.tokens.map((token, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded">
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{opportunity.description}</p>
                  
                  <button className="w-full bg-jupiter-primary hover:bg-jupiter-primary/90 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Start Farming
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {filteredOpportunities.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No opportunities found with the selected filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 