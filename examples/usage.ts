import { JupiterClient } from '../src';
import { Connection, Keypair } from '@solana/web3.js';

async function main() {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = Keypair.generate(); // Replace with your wallet

  const jupiter = new JupiterClient({ connection, wallet });

  // Real token mint addresses
  const SOL_MINT = 'So11111111111111111111111111111111111111112';
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  console.log('🚀 Jupiter SDK Example');
  console.log('======================\n');

  try {
    // Get a quote (1 SOL = 1e9 lamports)
    console.log('📊 Getting quote for 1 SOL → USDC...');
    const quote = await jupiter.getQuote(SOL_MINT, USDC_MINT, 1e9);
    console.log('✅ Quote received!');
    console.log(`Route: ${quote.routePlan.map(p => p.swapInfo.label).join(' → ')}`);
    console.log(`Output: ${quote.outAmount} USDC`);
    console.log(`Price Impact: ${quote.priceImpactPct}%\n`);

    // Compare routes
    console.log('🛣️  Getting route options...');
    const routes = await jupiter.getRouteOptions(SOL_MINT, USDC_MINT, 1e9, {
      preferCheapest: true,
      maxHops: 3,
    });
    console.log(`✅ Found ${routes.length} routes!`);
    
    routes.slice(0, 3).forEach((route, index) => {
      console.log(`Route ${index + 1}: ${route.dexPath.join(' → ')} (Score: ${route.score.toFixed(2)})`);
    });
    console.log('');

    // Get SOL price (optional - might fail)
    console.log('💰 Getting SOL price...');
    try {
      const solPrice = await jupiter.getSolPrice();
      console.log(`✅ SOL price: $${solPrice.toFixed(2)}\n`);
    } catch (error) {
      console.log('⚠️  SOL price API not available (this is normal for some endpoints)\n');
    }

    // Health check
    console.log('🏥 Checking system health...');
    const health = await jupiter.healthCheck();
    console.log(`Jupiter API: ${health.jupiter ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`Solana RPC: ${health.solana ? '✅ Healthy' : '❌ Unhealthy'}\n`);

    console.log('🎉 Example completed successfully!');
    console.log('\n✅ Working features:');
    console.log('  - Token quotes with best routes');
    console.log('  - Route comparison and scoring');
    console.log('  - System health checks');
    console.log('\nNote: No actual swaps were executed (wallet is a placeholder)');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

main().catch(console.error); 