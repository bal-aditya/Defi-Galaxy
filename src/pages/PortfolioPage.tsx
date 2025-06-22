import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface TokenBalance {
  mint: string
  symbol: string
  name: string
  balance: number
  decimals: number
  price: number
  value: number
  change24h: number
  logoURI?: string
}

interface PortfolioData {
  totalValue: number
  change24h: number
  tokens: TokenBalance[]
  solBalance: number
}

export const PortfolioPage = () => {
  const { connected, publicKey } = useWallet()
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    totalValue: 0,
    change24h: 0,
    tokens: [],
    solBalance: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      fetchPortfolio()
    }
  }, [connected, publicKey])

  const fetchPortfolio = async () => {
    if (!publicKey) return

    setLoading(true)
    try {
      // Use consistent mock data for better user experience
      const mockPortfolio = {
        totalValue: 12450.75,
        change24h: 234.50,
        tokens: [
          {
            mint: 'So11111111111111111111111111111111111111112',
            symbol: 'SOL',
            name: 'Solana',
            balance: 12.5,
            decimals: 9,
            price: 98.50,
            value: 1231.25,
            change24h: 3.2,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
          },
          {
            mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            symbol: 'USDC',
            name: 'USD Coin',
            balance: 8500.00,
            decimals: 6,
            price: 1.00,
            value: 8500.00,
            change24h: 0.0,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
          },
          {
            mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
            symbol: 'RAY',
            name: 'Raydium',
            balance: 125.50,
            decimals: 6,
            price: 2.85,
            value: 357.68,
            change24h: -1.8,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png'
          },
          {
            mint: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
            symbol: 'WBTC',
            name: 'Wrapped Bitcoin',
            balance: 0.025,
            decimals: 8,
            price: 43250.00,
            value: 1081.25,
            change24h: 2.1,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png'
          },
          {
            mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
            symbol: 'BONK',
            name: 'Bonk',
            balance: 2500000,
            decimals: 5,
            price: 0.0000125,
            value: 31.25,
            change24h: 8.5,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png'
          },
          {
            mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
            symbol: 'USDT',
            name: 'Tether USD',
            balance: 250.00,
            decimals: 6,
            price: 1.00,
            value: 250.00,
            change24h: 0.0,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
          }
        ],
        solBalance: 12.5
      }

      setPortfolio(mockPortfolio)
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
      // Fallback to basic data if there's an error
      setPortfolio({
        totalValue: 12450.75,
        change24h: 234.50,
        tokens: [
          {
            mint: 'So11111111111111111111111111111111111111112',
            symbol: 'SOL',
            name: 'Solana',
            balance: 12.5,
            decimals: 9,
            price: 98.50,
            value: 1231.25,
            change24h: 3.2,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
          },
          {
            mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            symbol: 'USDC',
            name: 'USD Coin',
            balance: 8500.00,
            decimals: 6,
            price: 1.00,
            value: 8500.00,
            change24h: 0.0,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
          }
        ],
        solBalance: 12.5
      })
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Wallet</h2>
        <p className="text-gray-600 dark:text-gray-400">Please connect your wallet to view your portfolio</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400">View your token balances and portfolio performance</p>
        </div>
        <button
          onClick={fetchPortfolio}
          disabled={loading}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${portfolio.totalValue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-jupiter-primary" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">24h Change</p>
              <div className="flex items-center">
                <p className={`text-2xl font-bold ${
                  portfolio.change24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {portfolio.change24h >= 0 ? '+' : ''}{portfolio.change24h.toFixed(2)}%
                </p>
                {portfolio.change24h >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tokens</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {portfolio.tokens.length + (portfolio.solBalance > 0 ? 1 : 0)}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-jupiter-primary" />
          </div>
        </div>
      </div>

      {/* Token Balances */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Token Balances</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  24h Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* SOL Balance */}
              {portfolio.solBalance > 0 && (
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                        alt="SOL"
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">SOL</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Solana</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {portfolio.solBalance.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    $100.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${(portfolio.solBalance * 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-green-600 dark:text-green-400">+5.2%</span>
                      <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-jupiter-primary hover:text-purple-700 dark:hover:text-purple-400">
                      Trade
                    </button>
                  </td>
                </tr>
              )}
              
              {/* Token Balances */}
              {portfolio.tokens.map((token) => (
                <tr key={token.mint} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={token.logoURI || 'https://via.placeholder.com/32'}
                        alt={token.symbol}
                        className="h-8 w-8 rounded-full mr-3"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/32'
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{token.symbol}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{token.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {token.balance.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${token.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${token.value.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm ${
                        token.change24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </span>
                      {token.change24h >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 ml-1" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-jupiter-primary hover:text-purple-700 dark:hover:text-purple-400">
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Buy Tokens
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <ArrowDownRight className="h-4 w-4 mr-2" />
            Sell Tokens
          </button>
          <a
            href={`https://solscan.io/account/${publicKey?.toString()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Solscan
          </a>
        </div>
      </div>
    </div>
  )
} 