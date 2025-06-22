import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Trash2,
  Plus,
  Settings
} from 'lucide-react'

interface AutomationStrategy {
  id: string
  name: string
  type: 'dca' | 'limit'
  status: 'active' | 'paused' | 'completed'
  tokenIn: string
  tokenOut: string
  amount: number
  frequency: string
  targetPrice?: number
  totalInvested: number
  totalBought: number
  nextExecution: string
  createdAt: string
}

export const AutomationPage = () => {
  const { connected } = useWallet()
  const [strategies, setStrategies] = useState<AutomationStrategy[]>([
    {
      id: '1',
      name: 'SOL DCA Strategy',
      type: 'dca',
      status: 'active',
      tokenIn: 'USDC',
      tokenOut: 'SOL',
      amount: 100,
      frequency: 'Daily',
      totalInvested: 500,
      totalBought: 4.2,
      nextExecution: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: '2',
      name: 'RAY Limit Buy',
      type: 'limit',
      status: 'active',
      tokenIn: 'USDC',
      tokenOut: 'RAY',
      amount: 50,
      frequency: 'Once',
      targetPrice: 2.5,
      totalInvested: 0,
      totalBought: 0,
      nextExecution: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    type: 'dca' as 'dca' | 'limit',
    tokenIn: 'USDC',
    tokenOut: 'SOL',
    amount: '',
    frequency: 'Daily',
    targetPrice: ''
  })

  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === id 
        ? { ...strategy, status: strategy.status === 'active' ? 'paused' : 'active' }
        : strategy
    ))
  }

  const deleteStrategy = (id: string) => {
    setStrategies(prev => prev.filter(strategy => strategy.id !== id))
  }

  const createStrategy = () => {
    if (!newStrategy.name || !newStrategy.amount) return

    const strategy: AutomationStrategy = {
      id: Date.now().toString(),
      name: newStrategy.name,
      type: newStrategy.type,
      status: 'active',
      tokenIn: newStrategy.tokenIn,
      tokenOut: newStrategy.tokenOut,
      amount: parseFloat(newStrategy.amount),
      frequency: newStrategy.frequency,
      targetPrice: newStrategy.targetPrice ? parseFloat(newStrategy.targetPrice) : undefined,
      totalInvested: 0,
      totalBought: 0,
      nextExecution: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    setStrategies(prev => [strategy, ...prev])
    setNewStrategy({
      name: '',
      type: 'dca',
      tokenIn: 'USDC',
      tokenOut: 'SOL',
      amount: '',
      frequency: 'Daily',
      targetPrice: ''
    })
    setShowCreateForm(false)
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Wallet</h2>
        <p className="text-gray-600 dark:text-gray-400">Please connect your wallet to manage automation strategies</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automation</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up automated trading strategies like DCA and limit orders
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Strategy
        </button>
      </div>

      {/* Create Strategy Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Automation Strategy</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={newStrategy.name}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., SOL DCA Strategy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Strategy Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNewStrategy(prev => ({ ...prev, type: 'dca' }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      newStrategy.type === 'dca'
                        ? 'border-jupiter-primary bg-jupiter-primary/5'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-jupiter-primary" />
                      <p className="text-sm font-medium">DCA</p>
                      <p className="text-xs text-gray-500">Dollar Cost Average</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setNewStrategy(prev => ({ ...prev, type: 'limit' }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      newStrategy.type === 'limit'
                        ? 'border-jupiter-primary bg-jupiter-primary/5'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-jupiter-primary" />
                      <p className="text-sm font-medium">Limit Order</p>
                      <p className="text-xs text-gray-500">Buy at target price</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Token In
                  </label>
                  <select
                    value={newStrategy.tokenIn}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, tokenIn: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Token Out
                  </label>
                  <select
                    value={newStrategy.tokenOut}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, tokenOut: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="SOL">SOL</option>
                    <option value="RAY">RAY</option>
                    <option value="SRM">SRM</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ({newStrategy.tokenIn})
                </label>
                <input
                  type="number"
                  value={newStrategy.amount}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="100"
                />
              </div>

              {newStrategy.type === 'dca' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newStrategy.frequency}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              )}

              {newStrategy.type === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Price ({newStrategy.tokenIn})
                  </label>
                  <input
                    type="number"
                    value={newStrategy.targetPrice}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, targetPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="100"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={createStrategy}
                disabled={!newStrategy.name || !newStrategy.amount}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Strategy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategies List */}
      <div className="space-y-4">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  strategy.type === 'dca' 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-blue-100 dark:bg-blue-900/20'
                }`}>
                  {strategy.type === 'dca' ? (
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{strategy.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {strategy.type === 'dca' ? 'Dollar Cost Average' : 'Limit Order'} • {strategy.tokenIn} → {strategy.tokenOut}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {strategy.status === 'active' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </span>
                ) : strategy.status === 'paused' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <Pause className="h-3 w-3 mr-1" />
                    Paused
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                    <XCircle className="h-3 w-3 mr-1" />
                    Completed
                  </span>
                )}
                
                <button
                  onClick={() => toggleStrategy(strategy.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {strategy.status === 'active' ? (
                    <Pause className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Play className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                
                <button
                  onClick={() => deleteStrategy(strategy.id)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {strategy.amount} {strategy.tokenIn}
                </p>
              </div>
              
              {strategy.type === 'dca' && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Frequency</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{strategy.frequency}</p>
                </div>
              )}
              
              {strategy.type === 'limit' && strategy.targetPrice && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Target Price</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {strategy.targetPrice} {strategy.tokenIn}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Invested</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {strategy.totalInvested} {strategy.tokenIn}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bought</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {strategy.totalBought} {strategy.tokenOut}
                </p>
              </div>
            </div>

            {strategy.status === 'active' && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-900 dark:text-blue-100">Next Execution</span>
                  </div>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {new Date(strategy.nextExecution).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {strategies.length === 0 && (
        <div className="card text-center py-12">
          <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Automation Strategies</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first automation strategy to start automated trading
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create Strategy
          </button>
        </div>
      )}

      {/* Info Section */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Automation Disclaimer</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Automated trading strategies are executed based on your settings. 
              Monitor your strategies regularly and ensure you have sufficient balances. 
              Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 