'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton to avoid hydration issues
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export const WalletConnect: FC = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">Wallet Connection</h2>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white font-bold py-2 px-4 rounded opacity-50">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-3 sm:space-y-4 p-4 sm:p-6 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">Wallet Connection</h2>
      
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full">
        <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto text-sm sm:text-base" />
        
        {connected && (
          <button
            onClick={disconnect}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto text-sm sm:text-base"
          >
            Disconnect
          </button>
        )}
      </div>

      {connected && publicKey && (
        <div className="text-center w-full">
          <p className="text-sm text-gray-600">Connected Wallet:</p>
          <p className="text-xs text-gray-800 font-mono break-all px-2">
            {publicKey.toString()}
          </p>
        </div>
      )}

      {!connected && (
        <p className="text-gray-600 text-center text-sm sm:text-base">
          Connect your wallet to start yield farming
        </p>
      )}
    </div>
  );
}; 