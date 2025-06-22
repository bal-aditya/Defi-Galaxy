import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { 
  ArrowRightLeft, 
  Info,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  DollarSign
} from 'lucide-react'

interface BridgeToken {
  symbol: string
  name: string
  logoURI: string
  ethereumAddress: string
  solanaAddress: string
  decimals: number
  minAmount: number
  maxAmount: number
  fee: number
  estimatedTime: string
}

interface BridgeTransaction {
  id: string
  fromChain: 'ethereum' | 'solana'
  toChain: 'ethereum' | 'solana'
  token: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  timestamp: string
  txHash?: string
}

const supportedTokens: BridgeToken[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    ethereumAddress: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C',
    solanaAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    minAmount: 10,
    maxAmount: 100000,
    fee: 0.1,
    estimatedTime: '5-10 minutes'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
    ethereumAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    solanaAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    minAmount: 10,
    maxAmount: 100000,
    fee: 0.1,
    estimatedTime: '5-10 minutes'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png',
    ethereumAddress: '0x0000000000000000000000000000000000000000',
    solanaAddress: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    decimals: 18,
    minAmount: 0.01,
    maxAmount: 100,
    fee: 0.05,
    estimatedTime: '10-15 minutes'
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
    ethereumAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    solanaAddress: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    decimals: 8,
    minAmount: 0.001,
    maxAmount: 10,
    fee: 0.02,
    estimatedTime: '10-15 minutes'
  }
]

const bridgeProviders = [
  {
    name: 'Wormhole',
    logo: 'https://wormhole.com/static/media/wormhole-logo.4c0c8b8c.svg',
    description: 'Most popular cross-chain bridge',
    fee: '0.1%',
    time: '5-10 min',
    url: 'https://portalbridge.com'
  },
  {
    name: 'Allbridge',
    logo: 'https://allbridge.io/static/media/logo.5c5c5c5c.svg',
    description: 'Fast and secure bridging',
    fee: '0.15%',
    time: '3-7 min',
    url: 'https://app.allbridge.io'
  },
  {
    name: 'Portal Bridge',
    logo: 'https://portalbridge.com/static/media/logo.6c6c6c6c.svg',
    description: 'Official Wormhole portal',
    fee: '0.1%',
    time: '5-10 min',
    url: 'https://portalbridge.com'
  }
]

export const BridgePage = () => {
  const { connected } = useWallet()
  const [selectedToken, setSelectedToken] = useState<BridgeToken>(supportedTokens[0])
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<'ethereum-to-solana' | 'solana-to-ethereum'>('ethereum-to-solana')
  const [selectedProvider, setSelectedProvider] = useState(bridgeProviders[0])
  const [transactions, setTransactions] = useState<BridgeTransaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load mock transaction history
    setTransactions([
      {
        id: 'bridge-1',
        fromChain: 'ethereum',
        toChain: 'solana',
        token: 'USDC',
        amount: 1000,
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        txHash: '0x1234567890abcdef'
      },
      {
        id: 'bridge-2',
        fromChain: 'solana',
        toChain: 'ethereum',
        token: 'USDT',
        amount: 500,
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    ])
  }, [])

  const handleBridge = async () => {
    if (!amount || parseFloat(amount) < selectedToken.minAmount || parseFloat(amount) > selectedToken.maxAmount) {
      return
    }

    setLoading(true)
    
    // Simulate bridge transaction
    setTimeout(() => {
      const newTransaction: BridgeTransaction = {
        id: `bridge-${Date.now()}`,
        fromChain: direction === 'ethereum-to-solana' ? 'ethereum' : 'solana',
        toChain: direction === 'ethereum-to-solana' ? 'solana' : 'ethereum',
        token: selectedToken.symbol,
        amount: parseFloat(amount),
        status: 'pending',
        timestamp: new Date().toISOString()
      }
      
      setTransactions(prev => [newTransaction, ...prev])
      setLoading(false)
      setAmount('')
    }, 2000)
  }

  const calculateFee = () => {
    if (!amount) return 0
    return parseFloat(amount) * (selectedProvider.fee.replace('%', '') as any / 100)
  }

  const calculateReceived = () => {
    if (!amount) return 0
    const fee = calculateFee()
    return parseFloat(amount) - fee
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Wallet</h2>
        <p className="text-gray-600 dark:text-gray-400">Please connect your wallet to bridge assets</p>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bridge Assets</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bridge tokens between Ethereum and Solana networks
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href="https://portalbridge.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Wormhole Portal
          </a>
        </div>
      </div>

      {/* Bridge Providers */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bridge Providers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bridgeProviders.map((provider) => (
            <button
              key={provider.name}
              onClick={() => setSelectedProvider(provider)}
              className={`p-4 rounded-lg border transition-colors ${
                selectedProvider.name === provider.name
                  ? 'border-jupiter-primary bg-jupiter-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-jupiter-primary">{provider.name[0]}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{provider.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{provider.description}</p>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Fee: {provider.fee}</span>
                <span>Time: {provider.time}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bridge Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bridge Interface */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bridge Tokens</h3>
          
          {/* Direction Toggle */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setDirection('ethereum-to-solana')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  direction === 'ethereum-to-solana'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>Ethereum</span>
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>Solana</span>
                </div>
              </button>
              <button
                onClick={() => setDirection('solana-to-ethereum')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  direction === 'solana-to-ethereum'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>Solana</span>
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>Ethereum</span>
                </div>
              </button>
            </div>
          </div>

          {/* Token Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Token
            </label>
            <div className="grid grid-cols-2 gap-2">
              {supportedTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token)}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedToken.symbol === token.symbol
                      ? 'border-jupiter-primary bg-jupiter-primary/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{token.symbol}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min: ${selectedToken.minAmount}, Max: ${selectedToken.maxAmount}`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Min: {selectedToken.minAmount} {selectedToken.symbol} | Max: {selectedToken.maxAmount} {selectedToken.symbol}
            </p>
          </div>

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={loading || !amount || parseFloat(amount) < selectedToken.minAmount || parseFloat(amount) > selectedToken.maxAmount}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Bridging...
              </div>
            ) : (
              `Bridge ${amount || '0'} ${selectedToken.symbol}`
            )}
          </button>
        </div>

        {/* Bridge Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bridge Details</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {amount || '0'} {selectedToken.symbol}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bridge Fee</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {calculateFee().toFixed(4)} {selectedToken.symbol}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">You'll Receive</span>
              <span className="text-sm font-medium text-jupiter-primary">
                {calculateReceived().toFixed(4)} {selectedToken.symbol}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Time</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedToken.estimatedTime}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Provider</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedProvider.name}
              </span>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Bridge Information</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Bridging tokens between networks takes time and incurs fees. 
                  Make sure you have enough gas fees on both networks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Bridge Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {tx.fromChain === 'ethereum' ? (
                        <ArrowDownRight className="h-4 w-4 text-blue-500 mr-2" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-2" />
                      )}
                      <span className="text-sm text-gray-900 dark:text-white">
                        {tx.fromChain.toUpperCase()} → {tx.toChain.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {tx.token}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tx.status === 'completed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    ) : tx.status === 'pending' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bridge Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Industry-standard security with audited smart contracts
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fast</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete bridges in minutes, not hours
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Low Fees</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Competitive fees starting from 0.1%
          </p>
        </div>
      </div>
    </div>
  )
} 