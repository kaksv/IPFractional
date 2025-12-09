import { useState, useEffect } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { FileText, DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react'
import { useMintIPAsset } from '../hooks/useIPContracts'
import { useStoryChain } from '../hooks/useStoryChain'
import { storyTestnet } from '../config/wagmi'

export default function MintIP() {
  const { isConnected } = useAccount()
  const navigate = useNavigate()
  const { mint, hash, isPending, isConfirming, isConfirmed, error } = useMintIPAsset()
  const { isCorrectChain } = useStoryChain()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    royaltyRate: '50',
    allowDerivatives: true,
    allowCommercial: false,
    fractionalOwnerRights: 'voting',
  })

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to mint an IP asset.</p>
        </div>
      </div>
    )
  }

  if (!isCorrectChain) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Wrong Network</h2>
          <p className="text-gray-600 mb-6">
            Please switch to <strong>Story Aeneid Testnet</strong> to mint IP assets. 
            You are currently on a different network .
          </p>
          <button
            onClick={() => switchChain({ chainId: storyTestnet.id })}
            disabled={isSwitching}
            className="btn-primary"
          >
            {isSwitching ? 'Switching...' : 'Switch to Story Aeneid Testnet'}
          </button>
        </div>
      </div>
    )
  }

  // Watch for successful minting
  useEffect(() => {
    if (isConfirmed && hash) {
      // Navigate to marketplace with refresh flag
      navigate('/marketplace', { state: { refresh: true, message: 'IP Asset minted successfully!' } })
    }
  }, [isConfirmed, hash, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Use IPFS or other decentralized storage for metadataURI
      // For now, using a placeholder - in production, upload to IPFS first
      const metadataURI = formData.imageUrl || 'ipfs://placeholder'
      
      await mint(
        formData.name,
        formData.description,
        metadataURI,
        parseInt(formData.royaltyRate),
        formData.allowDerivatives,
        formData.allowCommercial,
        formData.fractionalOwnerRights
      )
    } catch (error: any) {
      console.error('Error minting IP:', error)
      const errorMessage = error?.message || 'Failed to mint IP. Please try again.'
      alert(errorMessage)
      
      // If it's a chain error, the error message already contains helpful information
      if (errorMessage.includes('Story Aeneid Testnet')) {
        // User will see the specific error message about switching networks
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Mint Your IP Asset</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Connected to <strong>Story Aeneid Testnet</strong> (Chain ID: {storyTestnet.id})</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-primary-600" />
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP Asset Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g., 'The Legendary Hero', 'Midnight Symphony'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Describe your IP asset in detail..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="input-field"
                placeholder="https://example.com/image.png"
              />
            </div>
          </div>
        </div>

        {/* Licensing Rules */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2 text-primary-600" />
            Licensing Rules
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowDerivatives"
                checked={formData.allowDerivatives}
                onChange={(e) => setFormData({ ...formData, allowDerivatives: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="allowDerivatives" className="ml-2 text-gray-700">
                Allow derivative works (e.g., fan art, adaptations)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowCommercial"
                checked={formData.allowCommercial}
                onChange={(e) => setFormData({ ...formData, allowCommercial: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="allowCommercial" className="ml-2 text-gray-700">
                Allow commercial use
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fractional Owner Rights
              </label>
              <select
                value={formData.fractionalOwnerRights}
                onChange={(e) => setFormData({ ...formData, fractionalOwnerRights: e.target.value })}
                className="input-field"
              >
                <option value="voting">Voting on major decisions</option>
                <option value="revenue">Revenue share only</option>
                <option value="both">Voting + Revenue share</option>
              </select>
            </div>
          </div>
        </div>

        {/* Royalty Structure */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-primary-600" />
            Royalty Structure
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creator Royalty Share (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.royaltyRate}
                onChange={(e) => setFormData({ ...formData, royaltyRate: e.target.value })}
                className="input-field"
              />
              <p className="text-sm text-gray-500 mt-1">
                The remaining {100 - Number(formData.royaltyRate)}% will be distributed among fractional owners
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || isConfirming}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Confirming in wallet...' : isConfirming ? 'Minting...' : 'Mint IP Asset'}
          </button>
          {error && (
            <p className="text-red-600 text-sm mt-2">Error: {error.message}</p>
          )}
        </div>
      </form>
    </div>
  )
}

