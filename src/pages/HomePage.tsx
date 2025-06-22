import { Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Zap,
  BarChart3,
  Wallet,
  Settings,
  ExternalLink,
  Info,
  ArrowRightLeft
} from 'lucide-react'

const features = [
  {
    title: 'Best Swap Rates',
    description: 'Get the best rates across all Solana DEXs with Jupiter aggregation',
    icon: TrendingUp,
    color: 'text-green-600 dark:text-green-400'
  },
  {
    title: 'Secure Trading',
    description: 'Your funds never leave your wallet during swaps',
    icon: Shield,
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Lightning Fast',
    description: 'Execute trades in seconds with minimal slippage',
    icon: Zap,
    color: 'text-purple-600 dark:text-purple-400'
  }
]

const quickActions = [
  {
    title: 'Swap Tokens',
    description: 'Trade tokens with the best rates',
    href: '/swap',
    icon: TrendingUp,
    color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
  },
  {
    title: 'Bridge Assets',
    description: 'Bridge tokens between networks',
    href: '/bridge',
    icon: ArrowRightLeft,
    color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  },
  {
    title: 'View Portfolio',
    description: 'Check your token balances and performance',
    href: '/portfolio',
    icon: Wallet,
    color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Analytics',
    description: 'Track your trading history and performance',
    href: '/analytics',
    icon: BarChart3,
    color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
  },
  {
    title: 'Settings',
    description: 'Manage your preferences and wallet',
    href: '/settings',
    icon: Settings,
    color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
  }
]

export const HomePage = () => {
  const { connected } = useWallet()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Welcome to{' '}
          <span className="text-jupiter-primary">Jupiter Easy Swap</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          The easiest way to swap tokens on Solana. Get the best rates, lowest fees, and fastest execution with Jupiter's aggregation protocol.
        </p>
        
        {!connected ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/swap"
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center"
            >
              Start Swapping
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <a
              href="https://docs.jup.ag"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-8 py-3 flex items-center justify-center"
            >
              Learn More
              <ExternalLink className="h-5 w-5 ml-2" />
            </a>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/swap"
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center"
            >
              Swap Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <Link
              to="/portfolio"
              className="btn-secondary text-lg px-8 py-3 flex items-center justify-center"
            >
              View Portfolio
              <Wallet className="h-5 w-5 ml-2" />
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div key={feature.title} className="card text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <feature.icon className={`h-6 w-6 ${feature.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="group p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-jupiter-primary dark:hover:border-jupiter-primary transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-jupiter-primary dark:group-hover:text-purple-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-jupiter-primary mb-2">$2B+</div>
          <p className="text-gray-600 dark:text-gray-400">Total Volume</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-jupiter-primary mb-2">50+</div>
          <p className="text-gray-600 dark:text-gray-400">DEXs Aggregated</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-jupiter-primary mb-2">1M+</div>
          <p className="text-gray-600 dark:text-gray-400">Swaps Completed</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Powered by Jupiter
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              This application is built on top of Jupiter's aggregation protocol, providing you with the best swap routes 
              across all major Solana DEXs. Jupiter aggregates liquidity from Raydium, Orca, Serum, and many more to ensure 
              you always get the optimal trading experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 