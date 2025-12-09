import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { storyTestnet } from '../config/wagmi'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function ChainChecker() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  // Only show if connected and on wrong chain
  if (!isConnected || chainId === storyTestnet.id) {
    return null
  }

  return (
    <div className="card-dark border-l-4 border-yellow-400/50 mb-6 animate-slide-up">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white mb-1">
            Wrong Network
          </p>
          <p className="text-sm text-gray-400">
            Please switch to Story Aeneid Testnet to use this platform.
          </p>
        </div>
        <button
          onClick={() => switchChain({ chainId: storyTestnet.id })}
          disabled={isPending}
          className="ml-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold py-2 px-4 rounded-xl border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Switching...</span>
            </>
          ) : (
            <span>Switch Network</span>
          )}
        </button>
      </div>
    </div>
  )
}
