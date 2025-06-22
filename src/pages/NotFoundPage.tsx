import { Link } from 'react-router-dom'
import { 
  Home, 
  Search, 
  ArrowLeft, 
  AlertTriangle,
  BarChart3,
  Wallet,
  Settings
} from 'lucide-react'

export const NotFoundPage = () => {
  const quickLinks = [
    {
      name: 'Swap Tokens',
      description: 'Trade tokens with the best rates',
      href: '/swap',
      icon: Search
    },
    {
      name: 'Portfolio',
      description: 'View your token balances',
      href: '/portfolio',
      icon: Wallet
    },
    {
      name: 'Analytics',
      description: 'Track your trading performance',
      href: '/analytics',
      icon: BarChart3
    },
    {
      name: 'Settings',
      description: 'Manage your preferences',
      href: '/settings',
      icon: Settings
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="mx-auto h-24 w-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="group relative bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-jupiter-primary dark:hover:border-jupiter-primary transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <link.icon className="h-6 w-6 text-jupiter-primary group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-jupiter-primary dark:group-hover:text-purple-400 transition-colors">
                      {link.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Still having trouble?{' '}
            <a
              href="https://docs.jup.ag"
              target="_blank"
              rel="noopener noreferrer"
              className="text-jupiter-primary hover:text-purple-600 dark:hover:text-purple-400 font-medium"
            >
              Check our documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 