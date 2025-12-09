# Story Testnet Integration

This platform is now fully integrated with Story Protocol's Aeneid Testnet and uses IP as the native currency.

## Configuration

### Story Testnet Details
- **Chain ID**: 1513
- **Network Name**: Story Testnet (Aeneid)
- **RPC URL**: `https://testnet.storyrpc.io`
- **Native Currency**: IP
- **Block Explorer**: https://testnet.storyscan.io

### Chain Validation

The platform now includes automatic chain validation:

1. **ChainChecker Component**: Displays a warning banner if the user is on the wrong network
2. **WalletButton**: Shows chain status indicator (green checkmark for correct chain, red X for wrong chain)
3. **Transaction Pages**: Block transactions if not on Story Testnet and prompt user to switch

## Features

### Automatic Chain Switching
- Users can switch to Story Testnet directly from the UI
- All transaction pages check for correct chain before allowing actions
- Clear error messages guide users to switch networks

### IP Currency Integration
- All currency references updated from ETH to IP
- All amounts displayed in IP tokens
- Transaction costs and prices denominated in IP

## Getting Testnet IP Tokens

To get testnet IP tokens for testing:
1. Visit the Story Protocol faucet: https://www.story.foundation/build
2. Request testnet IP tokens
3. Use them to mint IP assets and interact with the platform

## Updated Files

- `src/config/wagmi.ts` - Story Testnet configuration
- `src/components/ChainChecker.tsx` - Chain validation component
- `src/components/WalletButton.tsx` - Chain status indicator
- `src/hooks/useStoryChain.ts` - Chain checking hook
- All pages updated to use IP instead of ETH
- All transaction pages include chain validation

## Usage

When users connect their wallet:
1. If on wrong chain, they'll see a warning banner
2. They can click "Switch Network" to automatically switch to Story Testnet
3. Once on Story Testnet, all features are available
4. All transactions use IP as the native currency

## Environment Variables

Optional: Add WalletConnect project ID to `.env.local`:
```
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```


