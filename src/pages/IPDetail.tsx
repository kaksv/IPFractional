import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useState, useMemo } from 'react'
import { DollarSign, Users, TrendingUp, Vote, Share2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useIPAsset, useFractionalization, usePurchaseFractions } from '../hooks/useIPContracts'
import { formatEther } from 'viem'
import { useStoryChain } from '../hooks/useStoryChain'

export default function IPDetail() {
  const { id } = useParams<{ id: string }>()
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const { isCorrectChain } = useStoryChain()
  const [purchaseAmount, setPurchaseAmount] = useState('')
  
  // Convert id to bigint
  const ipAssetId = useMemo(() => {
    if (!id) return undefined
    try {
      return BigInt(id)
    } catch {
      return undefined
    }
  }, [id])

  // Fetch IP asset data
  const { ipAsset: ipAssetData, isLoading: isLoadingAsset, error: assetError } = useIPAsset(ipAssetId)
  
  // Fetch fractionalization data
  const { fractionalization, isLoading: isLoadingFractionalization, error: fractionalizationError } = useFractionalization(ipAssetId)

  // Purchase hook
  const { purchase, isPending, isConfirming, isConfirmed, error: purchaseError } = usePurchaseFractions()

  // Transform IP asset data
  const ipAsset = useMemo(() => {
    if (!ipAssetData) return null
    
    const data = ipAssetData as any
    let imageUrl = data.metadataURI || ''
    if (imageUrl && imageUrl.startsWith('ipfs://')) {
      imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }

    return {
      id: String(data.id || id),
      name: data.name || '',
      description: data.description || '',
      creator: data.creator || '',
      imageUrl,
      mintedAt: new Date(Number(data.mintedAt || 0) * 1000),
      totalSupply: fractionalization ? Number(fractionalization.totalSupply || 0) : 0,
      fractionalized: data.fractionalized || false,
      royaltyRate: Number(data.royaltyRate || 0),
      allowDerivatives: data.allowDerivatives || false,
      allowCommercial: data.allowCommercial || false,
      fractionalOwnerRights: data.fractionalOwnerRights || '',
    }
  }, [ipAssetData, id, fractionalization])

  // Calculate available fractions
  const availableFractions = useMemo(() => {
    if (!fractionalization) return 0
    const sold = Number(fractionalization.sold || 0)
    const totalSupply = Number(fractionalization.totalSupply || 0)
    return Math.max(0, totalSupply - sold)
  }, [fractionalization])

  // Get price per fraction
  const pricePerFraction = useMemo(() => {
    if (!fractionalization) return '0'
    return formatEther(fractionalization.pricePerFraction || 0n)
  }, [fractionalization])

  // Check if fractionalization is active
  const isActive = fractionalization?.active || false

  const handlePurchase = async () => {
    if (!isConnected) {
      alert('Please connect your wallet')
      return
    }

    if (!isCorrectChain) {
      alert('Please switch to Story Aeneid Testnet')
      return
    }

    if (!ipAssetId) {
      alert('Invalid IP Asset ID')
      return
    }

    const amount = BigInt(purchaseAmount)
    if (amount <= 0n) {
      alert('Please enter a valid amount')
      return
    }

    if (amount > BigInt(availableFractions)) {
      alert(`Only ${availableFractions} fractions available`)
      return
    }

    try {
      await purchase(ipAssetId, amount, pricePerFraction)
      // Success will be handled by isConfirmed
    } catch (error: any) {
      console.error('Purchase error:', error)
      alert(error?.message || 'Failed to purchase fractions')
    }
  }

  // Reset form and show success message
  if (isConfirmed) {
    setTimeout(() => {
      setPurchaseAmount('')
      // Optionally refresh the page or refetch data
      window.location.reload()
    }, 2000)
  }

  const isLoading = isLoadingAsset || isLoadingFractionalization
  const error = assetError || fractionalizationError

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  if (error || !ipAsset) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading IP Asset</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'IP Asset not found'}
          </p>
          <Link to="/marketplace" className="btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  const totalCost = purchaseAmount && Number(purchaseAmount) > 0
    ? (Number(purchaseAmount) * Number(pricePerFraction)).toFixed(6)
    : '0'

  const ownershipPercentage = purchaseAmount && Number(purchaseAmount) > 0 && ipAsset.totalSupply > 0
    ? ((Number(purchaseAmount) / ipAsset.totalSupply) * 100).toFixed(4)
    : '0'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {ipAsset.imageUrl && (
            <img
              src={ipAsset.imageUrl}
              alt={ipAsset.name}
              className="w-full h-96 object-cover rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}

          <div className="card">
            <h1 className="text-4xl font-bold mb-4">{ipAsset.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{ipAsset.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Creator: {ipAsset.creator.slice(0, 6)}...{ipAsset.creator.slice(-4)}</span>
              <span>•</span>
              <span>Minted: {ipAsset.mintedAt.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold mb-2">Total Supply</h3>
              <p className="text-2xl font-bold text-primary-600">
                {ipAsset.totalSupply.toLocaleString()} tokens
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-2">Royalty Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {ipAsset.royaltyRate}% creator
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {100 - ipAsset.royaltyRate}% to fractional owners
              </p>
            </div>
          </div>

          {/* Fractionalization Status */}
          {ipAsset.fractionalized && (
            <div className="card">
              <h3 className="font-semibold mb-4">Fractionalization Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Supply</span>
                  <span className="font-semibold">{ipAsset.totalSupply.toLocaleString()} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sold</span>
                  <span className="font-semibold">
                    {fractionalization ? Number(fractionalization.sold || 0).toLocaleString() : 0} tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-semibold text-green-600">{availableFractions.toLocaleString()} tokens</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: ipAsset.totalSupply > 0 
                        ? `${((Number(fractionalization?.sold || 0) / ipAsset.totalSupply) * 100)}%`
                        : '0%'
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                  {ipAsset.totalSupply > 0 
                    ? `${((Number(fractionalization?.sold || 0) / ipAsset.totalSupply) * 100).toFixed(1)}% sold`
                    : '0% sold'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          {ipAsset.fractionalized && isActive ? (
            <div className="card">
              <h2 className="text-2xl font-semibold mb-4">Purchase Fractions</h2>
              
              {isConfirmed && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Purchase Successful!</span>
                  </div>
                </div>
              )}

              {purchaseError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{purchaseError.message || 'Purchase failed'}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Fraction
                  </label>
                  <p className="text-2xl font-bold text-primary-600">
                    {pricePerFraction} IP
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Purchase
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={availableFractions}
                    value={purchaseAmount}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '' || (Number(val) >= 1 && Number(val) <= availableFractions)) {
                        setPurchaseAmount(val)
                      }
                    }}
                    className="input-field"
                    placeholder="Enter amount"
                    disabled={isPending || isConfirming}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {availableFractions.toLocaleString()} available
                  </p>
                </div>

                {purchaseAmount && Number(purchaseAmount) > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-semibold text-lg">
                        {totalCost} IP
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Ownership:</span>
                      <span>
                        {ownershipPercentage}%
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePurchase}
                  disabled={
                    !isConnected || 
                    !isCorrectChain ||
                    !purchaseAmount || 
                    Number(purchaseAmount) <= 0 ||
                    Number(purchaseAmount) > availableFractions ||
                    isPending ||
                    isConfirming
                  }
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                      {isConfirming ? 'Confirming...' : 'Processing...'}
                    </>
                  ) : !isConnected ? (
                    'Connect Wallet to Purchase'
                  ) : !isCorrectChain ? (
                    'Switch to Story Aeneid Testnet'
                  ) : (
                    'Purchase Fractions'
                  )}
                </button>
              </div>
            </div>
          ) : ipAsset.fractionalized && !isActive ? (
            <div className="card">
              <h2 className="text-2xl font-semibold mb-4">Fractionalization</h2>
              <p className="text-gray-600">This IP asset has been fractionalized but sales are not currently active.</p>
            </div>
          ) : (
            <div className="card">
              <h2 className="text-2xl font-semibold mb-4">Not Fractionalized</h2>
              <p className="text-gray-600">This IP asset has not been fractionalized yet.</p>
            </div>
          )}

          {/* Stats Card */}
          <div className="card">
            <h3 className="font-semibold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold">
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {fractionalization && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per Fraction</span>
                    <span className="font-semibold">{pricePerFraction} IP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sold</span>
                    <span className="font-semibold">
                      {Number(fractionalization.sold || 0).toLocaleString()} / {ipAsset.totalSupply.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
