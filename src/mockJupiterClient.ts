// Mock Jupiter Client for UI Demo
export class MockJupiterClient {
  private connection: any;
  private wallet: any;

  constructor(config: any) {
    this.connection = config.connection;
    this.wallet = config.wallet;
  }

  async getQuote(fromToken: string, toToken: string, amount: number) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock quote response
    return {
      inputMint: fromToken,
      inAmount: amount.toString(),
      outputMint: toToken,
      outAmount: Math.floor(amount * 0.95).toString(), // Mock 5% slippage
      otherAmountThreshold: Math.floor(amount * 0.94).toString(),
      swapMode: "ExactIn",
      slippageBps: 50,
      platformFee: null,
      priceImpactPct: "0.05",
      routePlan: [
        {
          swapInfo: {
            ammKey: "mock-amm-key",
            label: "MockDEX",
            inputMint: fromToken,
            outputMint: toToken,
            inAmount: amount.toString(),
            outAmount: Math.floor(amount * 0.95).toString(),
            feeAmount: "0",
            feeMint: "11111111111111111111111111111111"
          },
          percent: 100
        }
      ],
      contextSlot: 123456789,
      timeTaken: 0.001,
      swapUsdValue: (amount * 0.95).toString(),
      simplerRouteUsed: false
    };
  }

  async getRouteOptions(fromToken: string, toToken: string, amount: number) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock route options
    return [
      {
        route: {
          inputMint: fromToken,
          outputMint: toToken,
          outAmount: Math.floor(amount * 0.95).toString(),
          priceImpactPct: "0.05",
          routePlan: [
            {
              swapInfo: {
                label: "MockDEX"
              }
            }
          ]
        },
        score: 95.5,
        estimatedTime: 2.5,
        riskLevel: "low" as const,
        dexPath: ["MockDEX"]
      },
      {
        route: {
          inputMint: fromToken,
          outputMint: toToken,
          outAmount: Math.floor(amount * 0.94).toString(),
          priceImpactPct: "0.06",
          routePlan: [
            {
              swapInfo: {
                label: "AlternativeDEX"
              }
            }
          ]
        },
        score: 92.3,
        estimatedTime: 3.2,
        riskLevel: "medium" as const,
        dexPath: ["AlternativeDEX"]
      }
    ];
  }

  async getSolPrice() {
    // Mock SOL price
    return 150.25;
  }

  async healthCheck() {
    return { jupiter: true, solana: true };
  }
} 