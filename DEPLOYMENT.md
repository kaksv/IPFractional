# Deployment Guide

This guide will walk you through deploying the smart contracts and integrating them with the frontend.

## Prerequisites

1. Node.js 18+ installed
2. A wallet with test ETH (for testnet deployment)
3. MetaMask or another Web3 wallet installed

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add:
   - `PRIVATE_KEY`: Your wallet's private key (for deployment)
   - `SEPOLIA_RPC_URL`: Sepolia testnet RPC URL (if deploying to Sepolia)
   - `ETHERSCAN_API_KEY`: Etherscan API key (for contract verification)

**⚠️ Security Warning**: Never commit your `.env` file to git. It's already in `.gitignore`.

## Step 3: Compile Smart Contracts

```bash
npm run compile
```

This will compile all Solidity contracts and generate artifacts in the `artifacts/` directory.

## Step 4: Deploy Contracts

### Option A: Deploy to Local Hardhat Network

1. Start a local Hardhat node in one terminal:
```bash
npm run node
```

This will start a local blockchain on `http://127.0.0.1:8545` with 20 test accounts.

2. In another terminal, deploy the contracts:
```bash
npm run deploy:local
```

The deployment script will:
- Deploy all contracts in the correct order
- Save deployment addresses to `deployments/localhost.json`
- Print a summary of all deployed contracts

### Option B: Deploy to Sepolia Testnet

1. Make sure your `.env` file has:
   - `PRIVATE_KEY`: Your wallet's private key
   - `SEPOLIA_RPC_URL`: A Sepolia RPC URL (e.g., from Infura or Alchemy)

2. Deploy to Sepolia:
```bash
npm run deploy:sepolia
```

3. The contracts will be deployed and addresses saved to `deployments/sepolia.json`

## Step 5: Update Frontend Configuration

After deployment, update the frontend to use the deployed contract addresses:

### Automatic Method (Recommended)

If you deployed to localhost:
```bash
npx ts-node scripts/update-env.ts localhost
```

If you deployed to Sepolia:
```bash
npx ts-node scripts/update-env.ts sepolia
```

This script will automatically update `.env.local` with the deployed contract addresses.

### Manual Method

1. Open `deployments/{network}.json` (e.g., `deployments/localhost.json`)

2. Copy the contract addresses and create/update `.env.local`:
```env
VITE_IP_ASSET_REGISTRY_ADDRESS=0x...
VITE_IP_FRACTIONALIZER_ADDRESS=0x...
VITE_ROYALTY_DISTRIBUTOR_ADDRESS=0x...
VITE_IP_MARKETPLACE_ADDRESS=0x...
VITE_IP_GOVERNANCE_ADDRESS=0x...
```

## Step 6: Configure Wallet Connection

1. Update `src/config/wagmi.ts` with your network configuration:
   - For localhost: The default config should work
   - For Sepolia: Update the chain configuration
   - For Story Protocol: Add the Story Protocol chain details

2. If using WalletConnect, add your project ID:
   - Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Update the `walletConnect` connector in `wagmi.ts`

## Step 7: Start the Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Step 8: Test the Integration

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection
2. **Mint IP Asset**: Go to "Mint IP" and create a new IP asset
3. **Fractionalize**: After minting, fractionalize the IP asset
4. **Purchase Fractions**: Buy fractional tokens
5. **View Dashboard**: Check your portfolio and royalties

## Contract Interaction Flow

### Minting an IP Asset

1. User fills out the mint form on `/mint`
2. Frontend calls `IPAssetRegistry.mintIPAsset()`
3. Transaction is sent to the blockchain
4. IP Asset is created with a unique ID

### Fractionalizing an IP Asset

1. Creator goes to IP detail page
2. Calls `IPFractionalizer.fractionalize()` with:
   - IP Asset ID
   - Total supply of fractional tokens
   - Price per fraction
3. ERC-1155 tokens are created and can be purchased

### Purchasing Fractions

1. User selects amount to purchase
2. Frontend calls `IPFractionalizer.purchaseFractions()` with ETH
3. Tokens are minted to the buyer's address
4. Payment is held in the contract (creator can withdraw)

### Trading on Marketplace

1. Seller calls `IPMarketplace.createListing()`
2. Tokens are transferred to the marketplace contract
3. Buyers can purchase via `IPMarketplace.purchaseFromListing()`
4. Marketplace takes a fee (default 2.5%)

### Royalty Distribution

1. Licensee sends payment to `RoyaltyDistributor.receiveRoyalty()`
2. Contract automatically splits revenue:
   - Creator gets their configured percentage
   - Remaining goes to fractional owners
3. Fractional owners call `claimRoyalties()` to withdraw

### Governance

1. Token holder creates proposal via `IPGovernance.createProposal()`
2. Other holders vote with `IPGovernance.vote()`
3. After voting period, anyone can execute if it passed

## Troubleshooting

### Contracts won't compile

- Make sure you have the correct Solidity version (0.8.20)
- Check that OpenZeppelin contracts are installed: `npm install @openzeppelin/contracts`

### Deployment fails

- Check that you have enough ETH in your wallet
- Verify your RPC URL is correct
- For localhost, make sure `npm run node` is running

### Frontend can't connect to contracts

- Verify contract addresses in `.env.local` match deployment
- Check that you're connected to the correct network
- Make sure the contracts are actually deployed (check `deployments/` folder)

### Transactions fail

- Check that you have enough ETH for gas
- Verify you're on the correct network
- Check contract addresses are correct

## Next Steps

1. **Add IPFS Integration**: Upload metadata to IPFS before minting
2. **Add Tests**: Write comprehensive tests for all contracts
3. **Security Audit**: Get contracts audited before mainnet deployment
4. **Story Protocol Integration**: Connect with Story Protocol SDK
5. **UI Improvements**: Enhance the frontend with better error handling and loading states

## Production Deployment Checklist

Before deploying to mainnet:

- [ ] Complete security audit
- [ ] Write comprehensive tests (aim for >90% coverage)
- [ ] Set up monitoring and alerting
- [ ] Configure proper access controls
- [ ] Add pause mechanisms for emergency stops
- [ ] Set up multi-sig wallet for contract ownership
- [ ] Document all contract functions
- [ ] Set up frontend error tracking
- [ ] Configure proper RPC endpoints
- [ ] Test on testnet extensively

## Support

For issues or questions:
1. Check the README.md
2. Review contract code comments
3. Check Hardhat documentation
4. Review OpenZeppelin documentation


