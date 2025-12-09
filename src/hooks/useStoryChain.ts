import { useAccount, useChainId } from 'wagmi'
import { storyTestnet } from '../config/wagmi'

/**
 * Hook to check if user is connected to Story Testnet
 */
export function useStoryChain() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const isCorrectChain = chainId === storyTestnet.id
  const isReady = isConnected && isCorrectChain

  return {
    isConnected,
    isCorrectChain,
    isReady,
    chainId,
    requiredChainId: storyTestnet.id,
  }
}

