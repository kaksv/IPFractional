import { useEffect, useRef } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { useNavigate, useLocation } from 'react-router-dom'
import { Wallet, CheckCircle, XCircle } from 'lucide-react'
import { storyTestnet } from '../config/wagmi'

export default function WalletButton() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()
  const location = useLocation()
  const prevConnectedRef = useRef(false)
  const hasNavigatedRef = useRef(false)

  const isCorrectChain = chainId === storyTestnet.id

  // Navigate to mint page when connection becomes successful
  useEffect(() => {
    // Check if connection status changed from false to true
    if (isConnected && !prevConnectedRef.current && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true
      // Only navigate if not already on the mint page
      if (location.pathname !== '/mint') {
        navigate('/mint')
      }
    }
    // Update previous connection state
    prevConnectedRef.current = isConnected
    // Reset navigation flag when disconnected
    if (!isConnected) {
      hasNavigatedRef.current = false
    }
  }, [isConnected, navigate, location.pathname])

  const handleDisconnect = () => {
    disconnect()
    navigate('/')
  }

  const handleConnect = () => {
    hasNavigatedRef.current = false
    connect({ connector: connectors[0] })
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm font-medium text-white">
          {isCorrectChain ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400" />
          )}
          <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="btn-secondary text-sm px-4 py-2"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="btn-primary text-sm"
    >
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </button>
  )
}
