# Yield Farming App

A Next.js application for yield farming on Solana with wallet detection and automated strategies.

## Features

### 🔗 Wallet Detection & Connection
- **Multi-wallet Support**: Phantom, Solflare, Backpack
- **Auto-connect**: Automatically connects to previously used wallet
- **Balance Display**: Real-time SOL and token balance tracking
- **Network Support**: Devnet, Testnet, and Mainnet-beta

### 🌾 Yield Farming Opportunities
- **Protocol Integration**: Raydium, Orca, Solend, Marinade
- **Risk Assessment**: Low, Medium, High risk categorization
- **APY Tracking**: Real-time APY rates for different strategies
- **TVL Monitoring**: Total Value Locked for each opportunity

### 📊 Farming Strategies
- **Conservative LP**: Low-risk liquidity provision
- **Balanced Yield**: Mix of lending and LP strategies
- **Aggressive Farming**: High-risk, high-reward protocols
- **Auto-compound**: Automatic reward reinvestment
- **Projection Calculator**: Earnings estimation tool

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop and mobile
- **Tailwind CSS**: Modern, clean styling
- **Real-time Updates**: Live balance and APY updates
- **Interactive Components**: Smooth animations and transitions

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Solana wallet extension (Phantom, Solflare, or Backpack)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yield-farming-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Wallet Setup

1. **Install a Solana wallet extension**
   - [Phantom](https://phantom.app/)
   - [Solflare](https://solflare.com/)
   - [Backpack](https://backpack.app/)

2. **Add some SOL to your wallet**
   - For testing: Use [Solana Faucet](https://faucet.solana.com/)
   - For mainnet: Purchase from an exchange

3. **Connect your wallet**
   - Click the "Connect Wallet" button
   - Approve the connection in your wallet extension

## Usage

### 1. Wallet Connection
- Click "Connect Wallet" to connect your Solana wallet
- View your SOL and token balances in real-time
- Disconnect when finished

### 2. Explore Opportunities
- Browse available yield farming opportunities
- Filter by risk level (Low, Medium, High)
- Sort by APY, TVL, or name
- View detailed information for each opportunity

### 3. Configure Strategies
- Select a farming strategy based on your risk tolerance
- Set the amount you want to invest
- Choose the duration for your farming position
- Enable auto-compound for maximum returns

### 4. Start Farming
- Review projected earnings
- Click "Start Farming Strategy"
- Approve the transaction in your wallet
- Monitor your position

## Project Structure

```
yield-farming-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with wallet provider
│   │   ├── page.tsx            # Main page component
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── WalletProvider.tsx  # Solana wallet context provider
│   │   ├── WalletConnect.tsx   # Wallet connection component
│   │   ├── BalanceDisplay.tsx  # Balance display component
│   │   ├── YieldFarmingOpportunities.tsx  # Opportunities list
│   │   └── FarmingStrategy.tsx # Strategy configuration
│   └── ...
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Solana Web3.js**: Solana blockchain interaction
- **Solana Wallet Adapter**: Wallet connection management
- **React Hooks**: State management and side effects

## Configuration

### Network Configuration
The app is configured for Solana Devnet by default. To change networks:

1. Edit `src/components/WalletProvider.tsx`
2. Change `WalletAdapterNetwork.Devnet` to:
   - `WalletAdapterNetwork.Testnet` for testnet
   - `WalletAdapterNetwork.Mainnet` for mainnet-beta

### RPC Endpoint
To use a custom RPC endpoint:

1. Edit `src/components/WalletProvider.tsx`
2. Replace `clusterApiUrl(network)` with your RPC URL

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Components

1. Create component in `src/components/`
2. Export as default or named export
3. Import in `src/app/page.tsx`
4. Add to the layout as needed

### Styling

The app uses Tailwind CSS for styling. To add custom styles:

1. Edit `src/app/globals.css`
2. Add custom CSS classes
3. Use Tailwind utilities for responsive design

## Security Considerations

- **Never share private keys**: Always use wallet extensions
- **Verify transactions**: Review all transaction details before signing
- **Test on devnet**: Test strategies on devnet before mainnet
- **Research protocols**: Understand risks before investing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This is a demo application for educational purposes. Always do your own research before investing in DeFi protocols. The authors are not responsible for any financial losses.

## Support

For questions or issues:
- Create an issue on GitHub
- Check the documentation
- Review Solana and wallet documentation

---

Built with ❤️ for the Solana ecosystem
