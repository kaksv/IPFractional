import { useAccount, useReadContracts, useChainId } from 'wagmi'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import { useAllIPAssets } from './useAllIPAssets'
import { CONTRACT_ADDRESSES, IP_FRACTIONALIZER_ABI, ROYALTY_DISTRIBUTOR_ABI } from '../lib/contracts'
import { storyTestnet } from '../config/wagmi'
import { IPAsset, FractionalToken, RoyaltyDistribution } from '../types'

/**
 * Hook to fetch all fractional tokens owned by the connected user
 */
export function useUserPortfolio() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const isCorrectChain = chainId === storyTestnet.id
  
  // Get all IP assets
  const { ipAssets, isLoading: isLoadingAssets, error: assetsError } = useAllIPAssets()

  // Create contracts to check user's balance for each fractionalized asset
  const balanceContracts = useMemo(() => {
    if (!address || !isConnected || !isCorrectChain) return []
    
    return ipAssets
      .filter(asset => asset.fractionalized && asset.totalSupply > 0)
      .map(asset => ({
        address: CONTRACT_ADDRESSES.IPFractionalizer,
        abi: IP_FRACTIONALIZER_ABI,
        functionName: 'getFractionBalance' as const,
        args: [BigInt(asset.id), address] as const,
      }))
  }, [ipAssets, address, isConnected, isCorrectChain])

  // Batch read all balances
  const { data: balancesData, isLoading: isLoadingBalances, error: balancesError } = useReadContracts({
    contracts: balanceContracts,
    query: {
      enabled: balanceContracts.length > 0 && isCorrectChain && isConnected,
    },
  })

  // Create contracts to check claimable royalties for each asset
  const royaltyContracts = useMemo(() => {
    if (!address || !isConnected || !isCorrectChain) return []
    
    return ipAssets
      .filter(asset => asset.fractionalized)
      .map(asset => ({
        address: CONTRACT_ADDRESSES.RoyaltyDistributor,
        abi: ROYALTY_DISTRIBUTOR_ABI,
        functionName: 'getClaimableRoyalties' as const,
        args: [BigInt(asset.id), address] as const,
      }))
  }, [ipAssets, address, isConnected, isCorrectChain])

  // Batch read all claimable royalties
  const { data: royaltiesData, isLoading: isLoadingRoyalties, error: royaltiesError } = useReadContracts({
    contracts: royaltyContracts,
    query: {
      enabled: royaltyContracts.length > 0 && isCorrectChain && isConnected,
    },
  })

  // Transform data into owned tokens
  const ownedTokens = useMemo(() => {
    if (!address || !isConnected || !balancesData || !Array.isArray(balancesData)) {
      return []
    }

    const tokens: (FractionalToken & { ipAsset: IPAsset })[] = []
    
    ipAssets.forEach((asset, index) => {
      if (!asset.fractionalized || asset.totalSupply === 0) return
      
      // Find corresponding balance result
      const balanceIndex = ipAssets
        .slice(0, index)
        .filter(a => a.fractionalized && a.totalSupply > 0)
        .length
      
      if (balanceIndex >= balancesData.length) return

      const balanceResult = balancesData[balanceIndex]
      if (
        balanceResult.status !== 'success' ||
        typeof balanceResult.result === 'undefined'
      ) return

      const balance = balanceResult.result as bigint
      if (balance === 0n) return // User doesn't own any tokens for this asset

      const amount = Number(balance)
      const percentage = (amount / asset.totalSupply) * 100

      tokens.push({
        tokenId: `token-${asset.id}`,
        ipAssetId: asset.id,
        owner: address,
        amount,
        percentage,
        ipAsset: asset,
      })
    })

    return tokens
  }, [ipAssets, balancesData, address, isConnected])

  // Calculate total portfolio value (using price per fraction * amount owned)
  const totalValue = useMemo(() => {
    return ownedTokens.reduce((sum, token) => {
      // Check if pricePerFraction exists and is a valid number
      const priceString = (token.ipAsset as any).pricePerFraction
      const pricePerFraction = typeof priceString === 'string' && !isNaN(Number(priceString))
        ? parseFloat(priceString)
        : 0
      return sum + (token.amount * pricePerFraction)
    }, 0)
  }, [ownedTokens])

  // Calculate total claimable royalties
  const totalClaimableRoyalties = useMemo(() => {
    if (!royaltiesData || !Array.isArray(royaltiesData)) return 0
    
    return ownedTokens.reduce((sum, token) => {
      const assetIndex = ipAssets.findIndex(a => a.id === token.ipAssetId)
      if (assetIndex === -1) return sum
      
      // Find corresponding royalty result
      const royaltyIndex = ipAssets
        .slice(0, assetIndex)
        .filter(a => a.fractionalized)
        .length
      
      if (royaltyIndex >= royaltiesData.length) return sum
      
      const royaltyResult = royaltiesData[royaltyIndex]
      if (royaltyResult.status !== 'success' || typeof royaltyResult.result === 'undefined') return sum
      
      const claimable = royaltyResult.result as bigint
      return sum + parseFloat(formatEther(claimable))
    }, 0)
  }, [ownedTokens, royaltiesData, ipAssets])

  return {
    ownedTokens,
    totalValue,
    totalClaimableRoyalties,
    isLoading: isLoadingAssets || isLoadingBalances || isLoadingRoyalties,
    error: assetsError || balancesError || royaltiesError,
  }
}

/**
 * Hook to fetch royalty distributions for assets owned by the user
 */
export function useUserRoyalties() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const isCorrectChain = chainId === storyTestnet.id
  
  // Get all IP assets
  const {  isLoading: isLoadingAssets } = useAllIPAssets()
  
  // Get user's portfolio to know which assets they own
  const { ownedTokens } = useUserPortfolio()

  // Create contracts to fetch distribution history for each owned asset
  const distributionContracts = useMemo(() => {
    if (!isConnected || !isCorrectChain || ownedTokens.length === 0) return []
    
    return ownedTokens.map(token => ({
      address: CONTRACT_ADDRESSES.RoyaltyDistributor,
      abi: ROYALTY_DISTRIBUTOR_ABI,
      functionName: 'getDistributionHistory' as const,
      args: [BigInt(token.ipAssetId)] as const,
    }))
  }, [ownedTokens, isConnected, isCorrectChain])

  // Batch read distribution histories
  const { data: distributionsData, isLoading: isLoadingDistributions } = useReadContracts({
    contracts: distributionContracts,
    query: {
      enabled: distributionContracts.length > 0 && isCorrectChain && isConnected,
    },
  })

  // Create contracts to get ownership percentages for calculating user's share
  const ownershipContracts = useMemo(() => {
    if (!address || !isConnected || !isCorrectChain || ownedTokens.length === 0) return []
    
    return ownedTokens.map(token => ({
      address: CONTRACT_ADDRESSES.IPFractionalizer,
      abi: IP_FRACTIONALIZER_ABI,
      functionName: 'getOwnershipPercentage' as const,
      args: [BigInt(token.ipAssetId), address] as const,
    }))
  }, [ownedTokens, address, isConnected, isCorrectChain])

  const { data: ownershipData } = useReadContracts({
    contracts: ownershipContracts,
    query: {
      enabled: ownershipContracts.length > 0 && isCorrectChain && isConnected,
    },
  })

  // Transform distribution data
  const royaltyDistributions = useMemo(() => {
    if (!address || !isConnected || !distributionsData || !Array.isArray(distributionsData)) {
      return []
    }

    const distributions: RoyaltyDistribution[] = []

    ownedTokens.forEach((token, tokenIndex) => {
      const distIndex = tokenIndex
      if (distIndex >= distributionsData.length) return
      
      const distResult = distributionsData[distIndex]
      // Adjust to access the correct data property according to lint error context
      if (distResult.status !== 'success' || !Array.isArray(distResult.result)) return

      const history = distResult.result
      if (history.length === 0) return

      // Get ownership percentage
      let ownershipPercentage = 0
      if (ownershipData && Array.isArray(ownershipData) && ownershipData[tokenIndex]) {
        const ownershipResult = ownershipData[tokenIndex]
        if (ownershipResult.status === 'success' && ownershipResult.result !== undefined) {
          // Ownership percentage is returned with 2 decimal precision (e.g., 500 = 5.00%)
          ownershipPercentage = Number(ownershipResult.result) / 100
        }
      }

      // Process each distribution in history
      history.forEach((dist: any) => {
        const totalRevenue = formatEther(dist.totalRevenue || 0n)
        const fractionalOwnersShare = formatEther(dist.fractionalOwnersShare || 0n)
        
        // Calculate user's share based on ownership percentage
        const userShare = (parseFloat(fractionalOwnersShare) * ownershipPercentage) / 100

        distributions.push({
          ipAssetId: token.ipAssetId,
          totalRevenue,
          creatorShare: formatEther(dist.creatorShare || 0n),
          fractionalOwnersShare,
          distributions: [
            {
              address: address,
              amount: userShare.toFixed(6),
              percentage: ownershipPercentage,
            },
          ],
          timestamp: new Date(Number(dist.timestamp || 0) * 1000),
        })
      })
    })

    // Sort by timestamp, newest first
    return distributions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [distributionsData, ownershipData, ownedTokens, address, isConnected])

  return {
    royaltyDistributions,
    isLoading: isLoadingAssets || isLoadingDistributions,
  }
}

