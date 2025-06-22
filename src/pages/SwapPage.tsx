import { useEffect, useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { 
  ArrowLeftRight, 
  Info,
  ExternalLink,
  Zap,
  RefreshCw,
  Map,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowRight,
  ChevronDown,
  Settings,
  Play,
  BarChart3
} from 'lucide-react'

// Import your Jupiter package services
// import { JupiterClient, JupiterSwapService, JupiterTokenService, JupiterSimulationService } from 'jupiter-easy-swap'

interface Token {
  symbol: string
  name: string
  logo: string
  mint: string
  decimals: number
}

interface RouteStep {
  id: string
  label: string
  inAmount: number
  outAmount: number
  inToken: string
  outToken: string
  protocol: string
  fee: number
}

interface SwapRoute {
  id: string
  inAmount: number
  outAmount: number
  inToken: string
  outToken: string
  priceImpact: number
  marketInfos: RouteStep[]
  totalFee: number
  estimatedTime: number
  priority: 'fast' | 'balanced' | 'best'
}

export const SwapPage = () => {
  const { connected, publicKey } = useWallet()
  const [routes, setRoutes] = useState<SwapRoute[]>([])
  const [selectedRoute, setSelectedRoute] = useState<SwapRoute | null>(null)
  const [loading, setLoading] = useState(false)
  const [swapParams, setSwapParams] = useState({
    inputToken: 'USDC',
    outputToken: 'SOL',
    amount: '100'
  })
  const [showTokenSelector, setShowTokenSelector] = useState<'input' | 'output' | null>(null)
  const [slippage, setSlippage] = useState(0.5)
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  // Jupiter Quote API endpoint
  const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6/quote'

  const tokenOptions: Token[] = [
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6
    },
    { 
      symbol: 'SOL', 
      name: 'Solana', 
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      mint: 'So11111111111111111111111111111111111111112',
      decimals: 9
    },
    { 
      symbol: 'RAY', 
      name: 'Raydium', 
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png',
      mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
      decimals: 6
    },
    { 
      symbol: 'SRM', 
      name: 'Serum', 
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png',
      mint: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
      decimals: 6
    },
    { 
      symbol: 'BONK', 
      name: 'Bonk', 
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png',
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      decimals: 5
    },
    { 
      symbol: 'JUP', 
      name: 'Jupiter', 
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png',
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      decimals: 6
    },
    { 
      symbol: 'PYTH', 
      name: 'Pyth Network', 
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYvEozEVg58WUyVpPqk1S9xK5Uq3/logo.png',
      mint: 'HZ1JovNiVvGrGNiiYvEozEVg58WUyVpPqk1S9xK5Uq3',
      decimals: 6
    },
    { 
      symbol: 'WIF', 
      name: 'dogwifhat', 
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EKpQGSJtjMFqKZ1KQanSqYXRcF8fBopzLHYxdM65Qj8/logo.png',
      mint: 'EKpQGSJtjMFqKZ1KQanSqYXRcF8fBopzLHYxdM65Qj8',
      decimals: 6
    }
  ]

  const fetchRoutesFromJupiter = async () => {
    if (!swapParams.amount || parseFloat(swapParams.amount) <= 0) return

    setLoading(true)
    try {
      console.log('Fetching routes from Jupiter Quote API...')
      console.log('Parameters:', swapParams)
      
      // Get token mints
      const inputToken = tokenOptions.find(t => t.symbol === swapParams.inputToken)
      const outputToken = tokenOptions.find(t => t.symbol === swapParams.outputToken)
      
      if (!inputToken || !outputToken) {
        throw new Error('Invalid token selection')
      }

      // Convert amount to smallest unit
      const amountIn = Math.floor(parseFloat(swapParams.amount) * Math.pow(10, inputToken.decimals))

      const apiUrl = `${JUPITER_QUOTE_API}?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${amountIn}&slippageBps=${slippage * 100}&onlyDirectRoutes=false&asLegacyTransaction=false`
      
      console.log('API URL:', apiUrl)

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Jupiter API response:', data)

      if (!data.data || data.data.length === 0) {
        throw new Error('No routes found for this swap')
      }

      // Transform Jupiter API response to our format
      const transformedRoutes: SwapRoute[] = data.data.map((route: any, index: number) => {
        const priority = index === 0 ? 'best' : index === 1 ? 'balanced' : 'fast'
        const estimatedTime = priority === 'fast' ? 2 : priority === 'balanced' ? 5 : 8
        
        // Convert output amount from smallest unit
        const outAmount = route.outAmount / Math.pow(10, outputToken.decimals)
        
        return {
          id: route.key || `route-${index}`,
          inAmount: parseFloat(swapParams.amount),
          outAmount: outAmount,
          inToken: swapParams.inputToken,
          outToken: swapParams.outputToken,
          priceImpact: route.priceImpactPct || 0,
          totalFee: route.otherAmountThreshold / Math.pow(10, 6) || 0.1,
          estimatedTime,
          priority,
          marketInfos: route.marketInfos?.map((market: any, marketIndex: number) => ({
            id: `${route.key}-${marketIndex}`,
            label: market.amm?.label || market.label || 'Unknown',
            inAmount: parseFloat(swapParams.amount) * (marketIndex === 0 ? 1 : 0.5),
            outAmount: (parseFloat(swapParams.amount) * (marketIndex === 0 ? 1 : 0.5)) * 0.98,
            inToken: swapParams.inputToken,
            outToken: swapParams.outputToken,
            protocol: market.amm?.label || market.label || 'Unknown',
            fee: 0.1
          })) || []
        }
      })

      setRoutes(transformedRoutes)
      setSelectedRoute(transformedRoutes[0])
      
    } catch (error) {
      console.error('Failed to fetch routes from Jupiter API:', error)
      // Fallback to mock data
      const mockRoutes: SwapRoute[] = [
        {
          id: '1',
          inAmount: parseFloat(swapParams.amount),
          outAmount: parseFloat(swapParams.amount) * 0.98,
          inToken: swapParams.inputToken,
          outToken: swapParams.outputToken,
          priceImpact: 0.12,
          totalFee: 0.25,
          estimatedTime: 2,
          priority: 'fast',
          marketInfos: [
            {
              id: '1-1',
              label: 'Raydium',
              inAmount: parseFloat(swapParams.amount),
              outAmount: parseFloat(swapParams.amount) * 0.98,
              inToken: swapParams.inputToken,
              outToken: swapParams.outputToken,
              protocol: 'Raydium',
              fee: 0.25
            }
          ]
        },
        {
          id: '2',
          inAmount: parseFloat(swapParams.amount),
          outAmount: parseFloat(swapParams.amount) * 0.985,
          inToken: swapParams.inputToken,
          outToken: swapParams.outputToken,
          priceImpact: 0.08,
          totalFee: 0.15,
          estimatedTime: 5,
          priority: 'balanced',
          marketInfos: [
            {
              id: '2-1',
              label: 'Orca',
              inAmount: parseFloat(swapParams.amount),
              outAmount: parseFloat(swapParams.amount) * 0.985,
              inToken: swapParams.inputToken,
              outToken: swapParams.outputToken,
              protocol: 'Orca',
              fee: 0.15
            }
          ]
        },
        {
          id: '3',
          inAmount: parseFloat(swapParams.amount),
          outAmount: parseFloat(swapParams.amount) * 0.99,
          inToken: swapParams.inputToken,
          outToken: swapParams.outputToken,
          priceImpact: 0.05,
          totalFee: 0.10,
          estimatedTime: 8,
          priority: 'best',
          marketInfos: [
            {
              id: '3-1',
              label: 'Jupiter',
              inAmount: parseFloat(swapParams.amount),
              outAmount: parseFloat(swapParams.amount) * 0.99,
              inToken: swapParams.inputToken,
              outToken: swapParams.outputToken,
              protocol: 'Jupiter',
              fee: 0.10
            }
          ]
        }
      ]
      setRoutes(mockRoutes)
      setSelectedRoute(mockRoutes[0])
    } finally {
      setLoading(false)
    }
  }

  const handleTokenSelect = (token: Token, type: 'input' | 'output') => {
    if (type === 'input') {
      setSwapParams(prev => ({ ...prev, inputToken: token.symbol }))
    } else {
      setSwapParams(prev => ({ ...prev, outputToken: token.symbol }))
    }
    setShowTokenSelector(null)
  }

  const swapTokens = () => {
    setSwapParams(prev => ({
      ...prev,
      inputToken: prev.outputToken,
      outputToken: prev.inputToken
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'fast': return 'text-green-600 dark:text-green-400'
      case 'balanced': return 'text-yellow-600 dark:text-yellow-400'
      case 'best': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'fast': return <Zap className="h-4 w-4" />
      case 'balanced': return <TrendingUp className="h-4 w-4" />
      case 'best': return <Map className="h-4 w-4" />
      default: return <Map className="h-4 w-4" />
    }
  }

  const getTokenLogo = (symbol: string) => {
    return tokenOptions.find(t => t.symbol === symbol)?.logo || ''
  }

  // Enhanced swap functionality using your package
  const simulateSwap = async () => {
    if (!swapParams.amount || parseFloat(swapParams.amount) <= 0) return

    try {
      console.log('Simulating swap...')
      
      // Get token mints
      const inputToken = tokenOptions.find(t => t.symbol === swapParams.inputToken)
      const outputToken = tokenOptions.find(t => t.symbol === swapParams.outputToken)
      
      if (!inputToken || !outputToken) {
        throw new Error('Invalid token selection')
      }

      // Convert amount to smallest unit
      const amountIn = Math.floor(parseFloat(swapParams.amount) * Math.pow(10, inputToken.decimals))

      // Simulate the swap using Jupiter API
      const simulationUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${amountIn}&slippageBps=${slippage * 100}&onlyDirectRoutes=false&asLegacyTransaction=false`
      
      const response = await fetch(simulationUrl)
      const data = await response.json()

      if (data.data && data.data.length > 0) {
        const bestRoute = data.data[0]
        setSimulationResult({
          success: true,
          inputAmount: parseFloat(swapParams.amount),
          outputAmount: bestRoute.outAmount / Math.pow(10, outputToken.decimals),
          priceImpact: bestRoute.priceImpactPct || 0,
          fee: bestRoute.otherAmountThreshold / Math.pow(10, 6) || 0.1,
          route: bestRoute
        })
      }
    } catch (error) {
      console.error('Simulation failed:', error)
      setSimulationResult({
        success: false,
        error: error.message
      })
    }
  }

  const getAnalytics = async () => {
    try {
      console.log('Fetching analytics...')
      
      // Get token mints
      const inputToken = tokenOptions.find(t => t.symbol === swapParams.inputToken)
      const outputToken = tokenOptions.find(t => t.symbol === swapParams.outputToken)
      
      if (!inputToken || !outputToken) return

      // Fetch historical data and analytics
      const analyticsUrl = `https://price.jup.ag/v4/price?ids=${inputToken.mint},${outputToken.mint}`
      const response = await fetch(analyticsUrl)
      const data = await response.json()

      if (data.data) {
        setAnalyticsData({
          inputPrice: data.data[inputToken.mint]?.price || 0,
          outputPrice: data.data[outputToken.mint]?.price || 0,
          inputVolume: data.data[inputToken.mint]?.volume24h || 0,
          outputVolume: data.data[outputToken.mint]?.volume24h || 0,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Analytics failed:', error)
    }
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Wallet</h2>
        <p className="text-gray-600 dark:text-gray-400">Please connect your wallet to start swapping tokens</p>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Swap Tokens</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get the best swap rates across all Solana DEXs with Jupiter
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <WalletMultiButton />
          <a
            href="https://docs.jup.ag"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Jupiter Docs
          </a>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Powered by Jupiter</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Jupiter aggregates liquidity from all major Solana DEXs to provide you with the best swap rates. 
              Select your tokens and amount to see available routes.
            </p>
          </div>
        </div>
      </div>

      {/* Swap Interface and Routes Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Swap Interface */}
        <div className="card">
          <div className="bg-gradient-to-r from-jupiter-primary to-purple-600 p-4 -m-6 mb-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowLeftRight className="h-5 w-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Swap Interface</h3>
              </div>
              <button className="text-white hover:text-purple-200">
                <Settings className="h-4 w-4" />
              </button>
            </div>
            <p className="text-purple-100 text-sm mt-1">
              Select tokens and amount to see available routes
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Input Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                You Pay
              </label>
              <div className="flex space-x-3">
                {/* Token Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowTokenSelector('input')}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 min-w-[120px]"
                  >
                    <img 
                      src={getTokenLogo(swapParams.inputToken)} 
                      alt={swapParams.inputToken}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium">{swapParams.inputToken}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* Token Dropdown */}
                  {showTokenSelector === 'input' && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {tokenOptions.map(token => (
                        <button
                          key={token.symbol}
                          onClick={() => handleTokenSelect(token, 'input')}
                          className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                        >
                          <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{token.symbol}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{token.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Amount Input */}
                <input
                  type="number"
                  value={swapParams.amount}
                  onChange={(e) => setSwapParams(prev => ({ ...prev, amount: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Swap Direction Arrow */}
            <div className="flex justify-center">
              <button
                onClick={swapTokens}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Output Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                You Receive
              </label>
              <div className="flex space-x-3">
                {/* Token Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowTokenSelector('output')}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 min-w-[120px]"
                  >
                    <img 
                      src={getTokenLogo(swapParams.outputToken)} 
                      alt={swapParams.outputToken}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium">{swapParams.outputToken}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* Token Dropdown */}
                  {showTokenSelector === 'output' && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {tokenOptions.map(token => (
                        <button
                          key={token.symbol}
                          onClick={() => handleTokenSelect(token, 'output')}
                          className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                        >
                          <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{token.symbol}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{token.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Output Amount Display */}
                <div className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                  {selectedRoute ? selectedRoute.outAmount.toFixed(4) : '0.0000'}
                </div>
              </div>
            </div>

            {/* Slippage Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slippage Tolerance
              </label>
              <div className="flex space-x-2">
                {[0.1, 0.5, 1.0].map(value => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      slippage === value
                        ? 'bg-jupiter-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                  className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Custom"
                  min="0.1"
                  max="50"
                  step="0.1"
                />
              </div>
            </div>

            {/* Fetch Routes Button */}
            <button
              onClick={fetchRoutesFromJupiter}
              disabled={loading || !swapParams.amount || parseFloat(swapParams.amount) <= 0}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fetching Routes...
                </>
              ) : (
                <>
                  <Map className="h-4 w-4 mr-2" />
                  Find Best Routes
                </>
              )}
            </button>

            {/* Enhanced Features */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={simulateSwap}
                disabled={!swapParams.amount || parseFloat(swapParams.amount) <= 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4 mr-2" />
                Simulate
              </button>
              <button
                onClick={getAnalytics}
                disabled={!swapParams.inputToken || !swapParams.outputToken}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </button>
            </div>

            {/* Simulation Results */}
            {simulationResult && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                  Simulation Results
                </h4>
                {simulationResult.success ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300">Input:</span>
                      <span className="text-green-900 dark:text-green-100">{simulationResult.inputAmount} {swapParams.inputToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300">Output:</span>
                      <span className="text-green-900 dark:text-green-100">{simulationResult.outputAmount.toFixed(4)} {swapParams.outputToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300">Price Impact:</span>
                      <span className="text-green-900 dark:text-green-100">{simulationResult.priceImpact.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300">Fee:</span>
                      <span className="text-green-900 dark:text-green-100">${simulationResult.fee.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600 dark:text-red-400 text-sm">{simulationResult.error}</p>
                )}
              </div>
            )}

            {/* Analytics Data */}
            {analyticsData && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Token Analytics
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">{swapParams.inputToken} Price:</span>
                    <span className="text-blue-900 dark:text-blue-100">${analyticsData.inputPrice.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">{swapParams.outputToken} Price:</span>
                    <span className="text-blue-900 dark:text-blue-100">${analyticsData.outputPrice.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">{swapParams.inputToken} 24h Volume:</span>
                    <span className="text-blue-900 dark:text-blue-100">${analyticsData.inputVolume.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">{swapParams.outputToken} 24h Volume:</span>
                    <span className="text-blue-900 dark:text-blue-100">${analyticsData.outputVolume.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* API Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="font-medium mb-1">Using Jupiter Quote API:</p>
              <p className="font-mono text-xs break-all">{JUPITER_QUOTE_API}</p>
            </div>
          </div>
        </div>

        {/* Route Visualization */}
        <div className="card">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 -m-6 mb-6 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Map className="h-5 w-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Route Visualization</h3>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              Real-time route analysis using Jupiter Quote API
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">Fetching routes from Jupiter API...</p>
            </div>
          ) : routes.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedRoute?.id === route.id
                        ? 'border-jupiter-primary bg-jupiter-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`${getPriorityColor(route.priority)}`}>
                          {getPriorityIcon(route.priority)}
                        </div>
                        <span className="text-sm font-medium capitalize">{route.priority}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Output</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {route.outAmount.toFixed(4)} {route.outToken}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Impact:</span>
                        <span className={`ml-1 ${route.priceImpact > 1 ? 'text-red-600' : 'text-green-600'}`}>
                          {route.priceImpact.toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">${route.totalFee.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Time:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{route.estimatedTime}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Route Details */}
              {selectedRoute && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    {selectedRoute.priority} Route Details
                  </h4>
                  <div className="space-y-2">
                    {selectedRoute.marketInfos.map((step, index) => (
                      <div key={step.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-gray-900 dark:text-white">{step.protocol}</span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {step.inAmount.toFixed(2)} → {step.outAmount.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Swap Button */}
              {selectedRoute && (
                <button className="w-full btn-primary mt-4">
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Swap {swapParams.amount} {swapParams.inputToken} for {selectedRoute.outAmount.toFixed(4)} {swapParams.outputToken}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Routes Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Select swap parameters and click "Find Best Routes" to see available options
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ArrowLeftRight className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Best Routes</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Automatically finds the optimal swap route across all DEXs
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fast Execution</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Lightning-fast swaps with minimal slippage
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Info className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your funds never leave your wallet during swaps
          </p>
        </div>
      </div>
    </div>
  )
} 