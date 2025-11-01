# ChainAnalytics - On-Chain Analysis Dashboard

A comprehensive blockchain analytics dashboard built with Hardhat, Solidity, Ethers.js, and React. This application provides real-time on-chain data analysis, transaction tracking, and address analytics with a beautiful, production-ready interface.

## Features

- **Real-time Blockchain Analytics**: Track transactions, addresses, and network statistics
- **Smart Contract Integration**: Custom Solidity contract for data storage and analysis
- **Wallet Connection**: MetaMask integration for blockchain interaction
- **Address Analysis**: Detailed insights for any Ethereum address
- **Transaction Recording**: Manual transaction recording and tracking
- **Beautiful UI**: Modern design with glass morphism effects and smooth animations

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Blockchain**: Hardhat + Solidity + Ethers.js
- **Icons**: Lucide React
- **Build Tool**: Vite

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MetaMask or compatible Web3 wallet
- Git

### Live Link:

Live Link: https://on-chain-analytics-dashboard-using.vercel.app/

### Installation

1. Install dependencies:
```bash
npm install
```

2. Compile smart contracts:
```bash
npm run compile
```

3. Start local Hardhat network:
```bash
npm run node
```

4. Deploy contracts (in a new terminal):
```bash
npm run deploy
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to the local development URL

### MetaMask Setup

1. Add the local Hardhat network to MetaMask:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

2. Import one of the Hardhat test accounts using the private keys shown in the terminal

## Smart Contract

The `OnChainAnalytics` contract provides:

- Transaction recording and storage
- Address analytics tracking
- Network statistics computation
- Event emission for real-time updates

### Key Functions

- `recordTransaction()`: Record new transactions
- `getAddressAnalytics()`: Get detailed address statistics
- `getNetworkStats()`: Retrieve network-wide statistics
- `getRecentTransactions()`: Fetch recent transaction history
- `getTopAddresses()`: Get top addresses by volume

## Project Structure

```
├── contracts/              # Solidity smart contracts
├── scripts/                # Deployment scripts
├── test/                   # Contract tests
├── src/
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── contracts/         # Contract artifacts and addresses
│   └── types/             # TypeScript type definitions
├── hardhat.config.js      # Hardhat configuration
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run compile` - Compile smart contracts
- `npm run test` - Run contract tests
- `npm run deploy` - Deploy contracts to local network
- `npm run node` - Start local Hardhat node

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
