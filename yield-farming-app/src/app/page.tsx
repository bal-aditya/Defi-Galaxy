'use client';

import { WalletConnect } from '@/components/WalletConnect';
import { BalanceDisplay } from '@/components/BalanceDisplay';
import { YieldFarmingOpportunities } from '@/components/YieldFarmingOpportunities';
import { FarmingStrategy } from '@/components/FarmingStrategy';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Yield Farming App</h1>
              <p className="text-sm sm:text-base text-gray-600">Maximize your DeFi returns on Solana</p>
            </div>
            <div className="w-full sm:w-auto">
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Wallet & Balance */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <BalanceDisplay />
            <FarmingStrategy />
          </div>

          {/* Right Column - Opportunities */}
          <div className="lg:col-span-2">
            <YieldFarmingOpportunities />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm sm:text-base">&copy; 2024 Yield Farming App. Built with Next.js and Solana.</p>
            <p className="text-xs sm:text-sm mt-1 sm:mt-2">
              This is a demo application. Always do your own research before investing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
