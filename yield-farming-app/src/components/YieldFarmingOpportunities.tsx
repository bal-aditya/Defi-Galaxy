'use client';

import { FC, useState } from 'react';

interface FarmingOpportunity {
  id: string;
  name: string;
  protocol: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  tokens: string[];
  description: string;
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
    description: 'Liquidity provision for SOL-USDC pair on Raydium'
  },
  {
    id: '2',
    name: 'JUP-USDC LP',
    protocol: 'Orca',
    apy: 18.2,
    tvl: 850000,
    risk: 'medium',
    tokens: ['JUP', 'USDC'],
    description: 'Liquidity provision for JUP-USDC pair on Orca'
  },
  {
    id: '3',
    name: 'BONK-SOL LP',
    protocol: 'Raydium',
    apy: 25.8,
    tvl: 320000,
    risk: 'high',
    tokens: ['BONK', 'SOL'],
    description: 'Liquidity provision for BONK-SOL pair on Raydium'
  },
  {
    id: '4',
    name: 'USDC Lending',
    protocol: 'Solend',
    apy: 8.3,
    tvl: 2500000,
    risk: 'low',
    tokens: ['USDC'],
    description: 'Lend USDC on Solend protocol'
  },
  {
    id: '5',
    name: 'SOL Staking',
    protocol: 'Marinade',
    apy: 6.8,
    tvl: 5000000,
    risk: 'low',
    tokens: ['SOL'],
    description: 'Stake SOL through Marinade Finance'
  }
];

export const YieldFarmingOpportunities: FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('apy');

  const filteredOpportunities = mockOpportunities
    .filter(opp => selectedRisk === 'all' || opp.risk === selectedRisk)
    .sort((a, b) => {
      switch (sortBy) {
        case 'apy':
          return b.apy - a.apy;
        case 'tvl':
          return b.tvl - a.tvl;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Yield Farming Opportunities</h2>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          >
            <option value="all">All Risks</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
        
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          >
            <option value="apy">APY (High to Low)</option>
            <option value="tvl">TVL (High to Low)</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredOpportunities.map((opportunity) => (
          <div key={opportunity.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-800">{opportunity.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{opportunity.protocol}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${
                opportunity.risk === 'low' ? 'bg-green-100 text-green-800' :
                opportunity.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {opportunity.risk.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600">APY:</span>
                <span className="font-bold text-green-600 text-sm sm:text-base">{opportunity.apy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600">TVL:</span>
                <span className="font-medium text-gray-800 text-sm sm:text-base">
                  ${(opportunity.tvl / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Tokens:</p>
              <div className="flex flex-wrap gap-1">
                {opportunity.tokens.map((token, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {token}
                  </span>
                ))}
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{opportunity.description}</p>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm sm:text-base">
              Start Farming
            </button>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm sm:text-base">No opportunities found with the selected filters</p>
        </div>
      )}
    </div>
  );
}; 