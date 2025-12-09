import { useAccount } from 'wagmi'
import { useState } from 'react'
import { DollarSign, TrendingUp, Package, Vote, ArrowUpRight, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUserPortfolio, useUserRoyalties } from '../hooks/useUserPortfolio'
import { useClaimRoyalties } from '../hooks/useIPContracts'

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'portfolio' | 'royalties' | 'governance'>('portfolio')
  
  // Fetch user's portfolio data
  const { 
    ownedTokens, 
    totalValue, 
    totalClaimableRoyalties, 
    isLoading: isLoadingPortfolio,
    error: portfolioError 
  } = useUserPortfolio()
  
  // Fetch royalty distributions
  const { 
    royaltyDistributions, 
    isLoading: isLoadingRoyalties 
  } = useUserRoyalties()
  
  // Hook for claiming royalties
  const { claim, isPending: isClaiming } = useClaimRoyalties()

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your dashboard.</p>
        </div>
      </div>
    )
  }

  // Calculate total royalties earned (from distributions)
  const totalRoyaltiesEarned = royaltyDistributions.reduce((sum, royalty) => {
    const userDistribution = royalty.distributions.find(
      d => d.address.toLowerCase() === address?.toLowerCase()
    )
    return sum + Number(userDistribution?.amount || 0)
  }, 0)

  const isLoading = isLoadingPortfolio || isLoadingRoyalties

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      {/* Error Display */}
      {portfolioError && (
        <div className="card bg-red-50 border border-red-200 mb-6">
          <p className="text-red-600">Error loading portfolio: {portfolioError.message}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Portfolio Value</p>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
              ) : (
                <p className="text-2xl font-bold">{totalValue.toFixed(4)} IP</p>
              )}
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Royalties Earned</p>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              ) : (
                <p className="text-2xl font-bold">{totalRoyaltiesEarned.toFixed(4)} IP</p>
              )}
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">IP Assets Owned</p>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              ) : (
                <p className="text-2xl font-bold">{ownedTokens.length}</p>
              )}
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Claimable Royalties Banner */}
      {totalClaimableRoyalties > 0 && (
        <div className="card bg-green-50 border border-green-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">Claimable Royalties Available</p>
              <p className="text-sm text-green-600">{totalClaimableRoyalties.toFixed(6)} IP ready to claim</p>
            </div>
            <button
              onClick={() => {
                // Claim royalties for all owned assets
                ownedTokens.forEach(token => {
                  claim(BigInt(token.ipAssetId)).catch(console.error)
                })
              }}
              disabled={isClaiming}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Claiming...
                </>
              ) : (
                'Claim All Royalties'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {(['portfolio', 'royalties', 'governance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : ownedTokens.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  You don't own any fractional IP tokens yet.{' '}
                  <Link to="/marketplace" className="text-primary-600 hover:underline">
                    Browse the marketplace
                  </Link>
                </p>
              ) : (
                ownedTokens.map((token) => (
                  <Link
                    key={token.tokenId}
                    to={`/ip/${token.ipAssetId}`}
                    className="block card hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      {token.ipAsset.imageUrl && (
                        <img
                          src={token.ipAsset.imageUrl}
                          alt={token.ipAsset.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{token.ipAsset.name}</h3>
                        <p className="text-sm text-gray-600">
                          {token.amount.toLocaleString()} tokens ({token.percentage.toFixed(2)}% ownership)
                        </p>
                        {token.ipAsset.pricePerFraction && (
                          <p className="text-sm text-gray-500 mt-1">
                            Value: {(token.amount * parseFloat(token.ipAsset.pricePerFraction)).toFixed(4)} IP
                          </p>
                        )}
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'royalties' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : royaltyDistributions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No royalties earned yet.</p>
              ) : (
                royaltyDistributions.map((royalty, index) => {
                  const userDistribution = royalty.distributions.find(
                    d => d.address.toLowerCase() === address?.toLowerCase()
                  )
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Royalty Distribution</p>
                          <p className="text-sm text-gray-500">
                            IP Asset #{royalty.ipAssetId} • {royalty.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        {userDistribution && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              +{userDistribution.amount} IP
                            </p>
                            <p className="text-sm text-gray-500">
                              {userDistribution.percentage.toFixed(2)}% share
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Total Revenue: {royalty.totalRevenue} IP</p>
                        <p>Creator Share: {royalty.creatorShare} IP</p>
                        <p>Fractional Owners Share: {royalty.fractionalOwnersShare} IP</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {activeTab === 'governance' && (
            <div>
              <p className="text-gray-500 text-center py-8">
                Governance proposals will appear here. You can vote on decisions for IP assets you own.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
