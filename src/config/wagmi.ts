import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Story Protocol Aeneid Testnet
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
      http: ['https://aeneid.storyrpc.io','https://aeneid.storyrpc.io'],
    },
    public: {
      http: ['https://testnet.storyrpc.io'],
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

export const config = createConfig({
  chains: [storyTestnet],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
  transports: {
    [storyTestnet.id]: http(),
  },
})
