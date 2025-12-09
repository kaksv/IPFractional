# Fractionalized IP Ownership Platform

A decentralized platform built on **Story Protocol L1 (Story Aeneid Testnet)** that allows creators to tokenize and sell partial ownership of their Intellectual Property (IP) assets. This platform enables fractional ownership, automated royalty distribution, and community governance for creative works.

![Platform Preview](https://res.cloudinary.com/dagn33ye3/image/upload/v1765194877/fractional-ownership_iqj8ov.jpg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Frontend Setup](#frontend-setup)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This platform enables creators to:

1. **Mint IP Assets**: Register creative works (stories, characters, songs, concepts) as on-chain IP Assets
2. **Fractionalize Ownership**: Split IP into tradeable tokens that can be sold to the community
3. **Automate Royalties**: Smart contracts automatically distribute licensing revenue to creators and fractional owners
4. **Community Governance**: Token holders can vote on major decisions affecting the IP

The platform uses **IP** (the native currency of Story Protocol) for all transactions and is built specifically for the **Story Aeneid Testnet**.

## ✨ Features

### 🏗️ Foundational IP Structuring

- **Mint IP Assets**: Creators can mint their creative works as IP Assets (IPA) on-chain
- **Metadata Storage**: IPFS integration for decentralized metadata storage
- **Licensing Rules**: Define terms for derivative works and commercial use
- **Royalty Configuration**: Set royalty rates (0-100%) for automatic distribution
- **Fractional Owner Rights**: Specify voting, revenue, or both rights for token holders

### 🧩 Fractionalization & Marketplace

- **ERC-1155 Tokens**: Fractional ownership represented as ERC-1155 compatible tokens
- **Flexible Supply**: Creators choose total supply of fractional tokens
- **Fixed Price Sales**: Set price per fraction for initial sale
- **Marketplace Integration**: Browse and purchase fractional tokens
- **Real-time Data**: Live updates of available fractions and sales

### 💸 Revenue & Royalty Automation

- **Automatic Distribution**: Smart contracts split revenue based on ownership percentages
- **Creator Share**: Configurable percentage goes to original creator
- **Fractional Owner Share**: Remaining percentage distributed proportionally
- **Claimable Royalties**: Token holders can claim accumulated royalties
- **Revenue Tracking**: Dashboard shows total revenue and individual earnings

### 🗳️ Governance

- **Create Proposals**: Token holders can create governance proposals
- **Vote on Decisions**: Weighted voting based on token ownership
- **Proposal Types**: Approve licensing deals, sequels, and IP-related decisions
- **Voting Periods**: Configurable voting periods (minimum 7 days)
- **Quorum Requirements**: Minimum participation thresholds

### 🎨 Modern UI/UX

- **Glassmorphic Design**: Sleek black and white design with glassmorphism effects
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Fade-in, slide-up, and hover effects
- **Real-time Updates**: Live data fetching and automatic refresh
- **Chain Validation**: Automatic network switching prompts

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18.2+ with TypeScript
- **Build Tool**: Vite 5.0+
- **Styling**: Tailwind CSS 3.3+ with custom glassmorphism utilities
- **Web3 Integration**: 
  - Wagmi 2.5+ (React hooks for Ethereum)
  - Viem 2.0+ (TypeScript Ethereum library)
  - @tanstack/react-query 5.14+ (Data fetching)
- **Routing**: React Router v6.20+
- **Icons**: Lucide React
- **State Management**: React Hooks

### Smart Contracts

- **Language**: Solidity ^0.8.20
- **Framework**: Hardhat 2.19+
- **Standards**: 
  - ERC-1155 for fractional tokens
  - OpenZeppelin Contracts 5.0+ (Ownable, ReentrancyGuard)
- **Testing**: Hardhat Test Suite
- **Deployment**: Hardhat deployment scripts

### Blockchain

- **Network**: Story Aeneid Testnet (Chain ID: 1315)
- **Native Currency**: IP (18 decimals)
- **RPC URL**: https://aeneid.storyrpc.io
- **Block Explorer**: https://aeneid.explorer.story.foundation/

## 🏛️ Architecture

### Smart Contract Architecture

```
IPAssetRegistry (Core)
    │
    ├── IPFractionalizer (ERC-1155)
    │   │
    │   ├── IPMarketplace (Secondary Trading)
    │   └── IPGovernance (Voting)
    │
    └── RoyaltyDistributor
        └── (Depends on IPFractionalizer)
```

### Frontend Architecture

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── WalletButton.tsx # Wallet connection
│   └── ChainChecker.tsx # Network validation
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── MintIP.tsx      # IP minting form
│   ├── Marketplace.tsx # Browse IP assets
│   ├── IPDetail.tsx    # IP asset details & purchase
│   ├── Dashboard.tsx   # User portfolio & royalties
│   └── Governance.tsx  # Governance proposals
├── hooks/              # Custom React hooks
│   ├── useIPContracts.ts    # Contract interaction hooks
│   ├── useAllIPAssets.ts    # Fetch all IP assets
│   ├── useUserPortfolio.ts  # User's tokens & royalties
│   └── useStoryChain.ts     # Chain validation
├── lib/                # Utilities
│   └── contracts.ts    # Contract addresses & ABIs
└── config/             # Configuration
    └── wagmi.ts        # Wagmi configuration
```

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (or yarn/pnpm)
- **Git**: For cloning the repository
- **Web3 Wallet**: MetaMask, WalletConnect, or compatible wallet
- **Story Testnet IP**: Get testnet IP from Story Protocol faucet
- **Code Editor**: VS Code recommended (with Solidity extension)

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd <repo directory>
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Frontend dependencies (React, Vite, Wagmi, etc.)
- Smart contract dependencies (Hardhat, OpenZeppelin, etc.)
- Development dependencies (TypeScript, ESLint, etc.)

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add the following variables:

```env
# Hardhat Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Story Testnet (if deploying to Story Testnet)
STORY_TESTNET_RPC_URL=https://aeneid.storyrpc.io

# WalletConnect (optional)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

**⚠️ Security Note**: Never commit your `.env` file or private keys to version control!

### Step 4: Compile Smart Contracts

```bash
npm run compile
```

This compiles all Solidity contracts and generates artifacts in the `artifacts/` directory.

## ⚙️ Configuration

### Story Testnet Configuration

The platform is configured to work with Story Aeneid Testnet. The configuration is in `src/config/wagmi.ts`:

```typescript
export const storyTestnet = defineChain({
  id: 1315,
  name: 'Story Aeneid Testnet',
  network: 'story-aeneid-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://aeneid.storyrpc.io'],
    },
    public: {
      http: ['https://aeneid.storyrpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Story Aeneid Explorer',
      url: 'https://aeneid.explorer.story.foundation/',
    },
  },
  testnet: true,
})
```

### Contract Addresses

After deploying contracts, update `src/lib/contracts.ts` with your deployed addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  IPAssetRegistry: '0x...' as `0x${string}`,
  IPFractionalizer: '0x...' as `0x${string}`,
  RoyaltyDistributor: '0x...' as `0x${string}`,
  IPMarketplace: '0x...' as `0x${string}`,
  IPGovernance: '0x...' as `0x${string}`,
}
```

## 📝 Smart Contract Deployment

### Local Development

1. **Start Local Hardhat Node**:
```bash
npm run node
```

This starts a local Ethereum node on `http://127.0.0.1:8545`

2. **Deploy Contracts** (in a new terminal):
```bash
npm run deploy:local
```

Deployment addresses will be saved to `deployments/localhost.json`

### Story Aeneid Testnet Deployment

1. **Add Story Testnet to Hardhat Config**:

Update `hardhat.config.ts`:

```typescript
networks: {
  storyTestnet: {
    url: process.env.STORY_TESTNET_RPC_URL || "https://aeneid.storyrpc.io",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 1315,
  },
}
```

2. **Deploy to Story Testnet**:

```bash
npm run deploy:story-testnet
```

Or create a script in `package.json`:

```json
"deploy:story": "hardhat run scripts/deploy.ts --network storyTestnet"
```

3. **Verify Contracts** (optional):

```bash
npx hardhat verify --network storyTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Deployment Order

Contracts must be deployed in this order due to dependencies:

1. **IPAssetRegistry** (no dependencies)
2. **IPFractionalizer** (depends on IPAssetRegistry)
3. **RoyaltyDistributor** (depends on IPAssetRegistry + IPFractionalizer)
4. **IPMarketplace** (depends on IPFractionalizer)
5. **IPGovernance** (depends on IPFractionalizer)

The deployment script (`scripts/deploy.ts`) handles this automatically.

### Update Frontend with Deployed Addresses

After deployment, update `src/lib/contracts.ts` with the deployed addresses, or use the update script:

```bash
npm run update-env
```

## 🎨 Frontend Setup

### Development Server

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage Guide

### For Creators

1. **Connect Wallet**: Click "Connect Wallet" and select your wallet
2. **Switch Network**: Ensure you're on Story Aeneid Testnet (Chain ID: 1315)
3. **Mint IP Asset**:
   - Navigate to "Mint IP" from the header
   - Fill in IP details (name, description, image URL)
   - Set royalty rate (0-100%)
   - Configure licensing rules
   - Submit transaction
4. **Fractionalize IP**:
   - Go to your IP asset detail page
   - Click "Fractionalize"
   - Set total supply and price per fraction
   - Submit transaction
5. **View Dashboard**: Check your portfolio, royalties, and IP performance

### For Investors

1. **Browse Marketplace**: View all available fractionalized IP assets
2. **View Details**: Click on an IP asset to see details
3. **Purchase Fractions**:
   - Enter amount of fractions to purchase
   - Review total cost and ownership percentage
   - Confirm transaction
4. **Track Portfolio**: View your holdings in the Dashboard
5. **Claim Royalties**: Claim accumulated royalties from the Dashboard
6. **Participate in Governance**: Vote on proposals for IP assets you own

### For Governance Participants

1. **View Proposals**: Navigate to Governance page
2. **Create Proposal** (if you own tokens):
   - Click "Create Proposal"
   - Enter title, description, and voting period
   - Submit transaction
3. **Vote on Proposals**:
   - Select a proposal
   - Choose "Vote For" or "Vote Against"
   - Submit vote (voting power = your token balance)

## 📁 Project Structure

```
story-cursor/
├── contracts/                 # Smart contracts
│   ├── IPAssetRegistry.sol    # Core IP asset registry
│   ├── IPFractionalizer.sol   # ERC-1155 fractionalization
│   ├── RoyaltyDistributor.sol # Automated royalty distribution
│   ├── IPMarketplace.sol      # Secondary marketplace
│   └── IPGovernance.sol       # Governance voting
├── scripts/                   # Deployment scripts
│   ├── deploy.ts             # Main deployment script
│   └── update-env.ts         # Update environment variables
├── src/
│   ├── components/            # React components
│   │   ├── Layout.tsx        # Main layout with navigation
│   │   ├── WalletButton.tsx  # Wallet connection button
│   │   └── ChainChecker.tsx  # Network validation component
│   ├── pages/                # Page components
│   │   ├── Home.tsx          # Landing page
│   │   ├── MintIP.tsx        # IP minting page
│   │   ├── Marketplace.tsx   # Marketplace browsing
│   │   ├── IPDetail.tsx      # IP asset details
│   │   ├── Dashboard.tsx     # User dashboard
│   │   └── Governance.tsx    # Governance page
│   ├── hooks/                # Custom React hooks
│   │   ├── useIPContracts.ts      # Contract interaction hooks
│   │   ├── useAllIPAssets.ts     # Fetch all IP assets
│   │   ├── useUserPortfolio.ts   # User portfolio data
│   │   └── useStoryChain.ts      # Chain validation
│   ├── lib/                  # Utilities
│   │   └── contracts.ts      # Contract addresses & ABIs
│   ├── config/               # Configuration
│   │   └── wagmi.ts          # Wagmi/Web3 configuration
│   ├── types/                # TypeScript types
│   │   └── index.ts          # Type definitions
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── test/                     # Smart contract tests
│   └── IPAssetRegistry.test.ts
├── deployments/              # Deployment addresses (generated)
├── artifacts/                # Compiled contracts (generated)
├── cache/                    # Hardhat cache (generated)
├── dist/                     # Production build (generated)
├── hardhat.config.ts         # Hardhat configuration
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── README.md                  # This file
```

## 🔐 Environment Variables

### Required for Smart Contracts

```env
PRIVATE_KEY=your_deployer_private_key
STORY_TESTNET_RPC_URL=https://aeneid.storyrpc.io
```

### Optional for Frontend

```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Getting a WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID
4. Add it to your `.env` file

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot use 'in' operator" Error

**Problem**: ABI parsing error when interacting with contracts.

**Solution**: Ensure contract ABIs in `src/lib/contracts.ts` are valid JSON arrays, not function signature strings.

#### 2. Network Mismatch

**Problem**: User is on wrong network.

**Solution**: 
- The app automatically prompts to switch to Story Aeneid Testnet
- Users can click "Switch Network" button
- Ensure MetaMask has Story Testnet added

#### 3. Contract Not Found

**Problem**: Contract addresses not configured.

**Solution**: 
- Update `src/lib/contracts.ts` with deployed addresses
- Ensure addresses are correctly formatted as `0x${string}`

#### 4. Transaction Fails

**Problem**: Transactions failing silently.

**Solution**:
- Check you have enough IP for gas
- Verify you're on the correct network
- Check contract addresses are correct
- Review browser console for error messages

#### 5. Data Not Loading

**Problem**: IP assets or proposals not showing.

**Solution**:
- Check RPC connection
- Verify contract addresses
- Check browser console for errors
- Ensure contracts are deployed and verified

### Getting Testnet IP

1. Visit Story Protocol's testnet faucet (if available)
2. Request testnet IP tokens
3. Ensure your wallet has enough for gas fees

## 🔒 Security Considerations

### Smart Contracts

- ✅ Uses OpenZeppelin's battle-tested libraries
- ✅ Reentrancy guards on all external functions
- ✅ Access control for sensitive operations
- ✅ Input validation on all user inputs
- ⚠️ **Before production deployment**:
  - Conduct comprehensive security audits
  - Add comprehensive test coverage
  - Implement additional access controls
  - Add pause mechanisms for emergency stops
  - Consider upgradeable contracts pattern

### Frontend

- ✅ Input validation on all forms
- ✅ Chain validation before transactions
- ✅ Error handling and user feedback
- ⚠️ **Security best practices**:
  - Never expose private keys
  - Validate all user inputs
  - Use HTTPS in production
  - Implement rate limiting
  - Regular dependency updates

## 🧪 Testing

### Smart Contract Tests

```bash
npm run test
```

### Frontend Testing

Currently, the frontend uses manual testing. Consider adding:
- React Testing Library
- Jest
- E2E tests with Playwright or Cypress

## 📚 Additional Resources

- [Story Protocol Documentation](https://docs.story.foundation/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint for code quality
- Write descriptive commit messages
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Story Protocol for the blockchain infrastructure
- OpenZeppelin for secure smart contract libraries
- The Web3 community for excellent tooling

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review the codebase

---

**Built with ❤️ on Story Protocol L1**
