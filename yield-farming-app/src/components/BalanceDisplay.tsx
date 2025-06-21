'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { FC, useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL, PublicKey, Connection } from '@solana/web3.js';

interface TokenBalance {
  mint: string;
  balance: number;
  decimals: number;
  symbol?: string;
}

export const BalanceDisplay: FC = () => {
  const { publicKey } = useWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchBalances = async () => {
    setLoading(true);
    
    const endpoints = [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana',
      'https://solana.public-rpc.com'
    ];
    
    for (let i = 0; i < endpoints.length; i++) {
      try {
        const connection = new Connection(endpoints[i], {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 60000
        });
        console.log(`🔍 Trying endpoint ${i + 1}:`, endpoints[i]);
        console.log('🔍 Fetching balance for wallet:', publicKey?.toString());
        
        // Test connection first with timeout
        const connectionPromise = connection.getBlockHeight('confirmed');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 8000)
        );
        
        const blockHeight = await Promise.race([connectionPromise, timeoutPromise]) as number;
        console.log('✅ Connection successful, block height:', blockHeight);
        setConnectionStatus(`Connected (${i + 1}/${endpoints.length})`);
        
        // Test with a known wallet address first using proper RPC method
        const testWallet = new PublicKey('11111111111111111111111111111112');
        const testBalance = await connection.getBalance(testWallet, 'confirmed');
        console.log('🧪 Test wallet balance:', testBalance / LAMPORTS_PER_SOL, 'SOL');
        
        if (!publicKey) {
          console.log('❌ No public key available');
          return;
        }
        
        // Fetch SOL balance using proper RPC method with confirmed commitment
        const balance = await connection.getBalance(publicKey, 'confirmed');
        console.log('💰 SOL balance (lamports):', balance);
        console.log('💰 SOL balance (SOL):', balance / LAMPORTS_PER_SOL);
        setSolBalance(balance / LAMPORTS_PER_SOL);

        // Fetch token accounts using proper RPC method
        console.log('🔍 Fetching token accounts...');
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey, 
          {
            programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          },
          'confirmed'
        );

        console.log('🎯 Token accounts found:', tokenAccounts.value.length);

        const balances: TokenBalance[] = tokenAccounts.value.map(account => ({
          mint: account.account.data.parsed.info.mint,
          balance: account.account.data.parsed.info.tokenAmount.uiAmount || 0,
          decimals: account.account.data.parsed.info.tokenAmount.decimals,
        }));

        console.log('📊 Token balances:', balances);
        setTokenBalances(balances);
        
        // Success! Break out of the loop
        break;
        
      } catch (error) {
        console.error(`❌ Endpoint ${i + 1} failed:`, error);
        if (i === endpoints.length - 1) {
          // All endpoints failed
          console.error('❌ All endpoints failed');
          setConnectionStatus('All endpoints failed - Try manual input');
          setSolBalance(0);
          setTokenBalances([]);
          
          // Show a manual input option
          const manualBalance = prompt('All RPC endpoints failed. Please enter your SOL balance manually (optional):');
          if (manualBalance && !isNaN(Number(manualBalance))) {
            setSolBalance(Number(manualBalance));
            setConnectionStatus('Manual balance entered');
          }
        } else {
          console.log(`🔄 Retrying with endpoint ${i + 2}...`);
          setConnectionStatus(`Retrying (${i + 2}/${endpoints.length})`);
        }
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (!publicKey || !mounted) {
      setSolBalance(null);
      setTokenBalances([]);
      return;
    }

    fetchBalances();
  }, [publicKey, mounted]);

  if (!mounted) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Balance</h2>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Balance</h2>
        <p className="text-gray-600">Connect your wallet to view balances</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Wallet Balance</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <span className={`text-xs px-2 py-1 rounded ${
            connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' : 
            connectionStatus === 'Connection failed' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {connectionStatus}
          </span>
          {publicKey && (
            <button
              onClick={fetchBalances}
              disabled={loading}
              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-2 py-1 rounded w-full sm:w-auto"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Loading balances...</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {/* SOL Balance */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">SOL</p>
              <p className="text-xs sm:text-sm text-gray-600">Solana</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-base sm:text-lg text-gray-800">
                {solBalance !== null ? solBalance.toFixed(4) : '0.0000'}
              </p>
            </div>
          </div>

          {/* Token Balances */}
          {tokenBalances.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Token Balances</h3>
              {tokenBalances.map((token, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {token.symbol || token.mint.slice(0, 8) + '...'}
                    </p>
                    <p className="text-xs text-gray-600 font-mono truncate">
                      {token.mint}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-gray-800 text-sm sm:text-base">
                      {token.balance.toFixed(4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tokenBalances.length === 0 && (
            <p className="text-gray-600 text-center text-sm sm:text-base">No token balances found</p>
          )}
        </div>
      )}
    </div>
  );
}; 