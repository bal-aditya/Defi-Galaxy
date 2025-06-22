import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { 
  Settings, 
  Moon, 
  Sun, 
  Wallet, 
  Bell, 
  Shield, 
  Globe, 
  Info,
  Copy,
  ExternalLink,
  Check,
  AlertTriangle
} from 'lucide-react'

interface SettingsSection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const settingsSections: SettingsSection[] = [
  {
    id: 'appearance',
    title: 'Appearance',
    icon: Sun,
    description: 'Customize the look and feel of the application'
  },
  {
    id: 'wallet',
    title: 'Wallet',
    icon: Wallet,
    description: 'Manage your connected wallet and preferences'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    description: 'Configure notification preferences'
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    description: 'Security settings and privacy options'
  },
  {
    id: 'network',
    title: 'Network',
    icon: Globe,
    description: 'Network and RPC endpoint settings'
  }
]

export const SettingsPage = () => {
  const { connected, publicKey, disconnect } = useWallet()
  const [activeSection, setActiveSection] = useState('appearance')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [notifications, setNotifications] = useState({
    swapSuccess: true,
    priceAlerts: false,
    newsUpdates: false
  })
  const [copied, setCopied] = useState(false)

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    // Apply theme to document
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between light and dark themes
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Display</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Show Token Prices</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Display real-time token prices in portfolio
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Compact Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use a more compact layout
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </div>
          </div>
        )

      case 'wallet':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connected Wallet</h3>
              {connected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wallet className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Connected</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={copyAddress}
                      className="btn-secondary flex items-center"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={disconnect}
                      className="btn-secondary flex-1"
                    >
                      Disconnect
                    </button>
                    <a
                      href={`https://solscan.io/account/${publicKey?.toString()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center flex-1 justify-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Solscan
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No wallet connected</p>
                  <WalletMultiButton />
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wallet Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-connect</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically connect wallet on page load
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Show Balance</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Display wallet balance in header
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Swap Success</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notify when swaps complete successfully
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.swapSuccess}
                    onChange={(e) => setNotifications(prev => ({ ...prev, swapSuccess: e.target.checked }))}
                    className="toggle" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Price Alerts</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified of significant price changes
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.priceAlerts}
                    onChange={(e) => setNotifications(prev => ({ ...prev, priceAlerts: e.target.checked }))}
                    className="toggle" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">News Updates</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive updates about new features
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.newsUpdates}
                    onChange={(e) => setNotifications(prev => ({ ...prev, newsUpdates: e.target.checked }))}
                    className="toggle" 
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Transaction Confirmations</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Require confirmation for all transactions
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Slippage Protection</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Warn about high slippage trades
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Analytics</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow anonymous usage analytics
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </div>
          </div>
        )

      case 'network':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Network Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Network
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="mainnet">Mainnet</option>
                    <option value="devnet">Devnet</option>
                    <option value="testnet">Testnet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    RPC Endpoint
                  </label>
                  <input 
                    type="text" 
                    defaultValue="https://api.mainnet-beta.solana.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Network Warning</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Changing network settings may affect your wallet connection and transaction history. 
                    Make sure you're on the correct network for your intended operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your application preferences and wallet settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-jupiter-primary text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">{section.title}</p>
                    <p className="text-xs opacity-75">{section.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {renderSection()}
        </div>
      </div>
    </div>
  )
} 