import { useReadContract, useReadContracts, useChainId } from 'wagmi'
import { CONTRACT_ADDRESSES, IP_ASSET_REGISTRY_ABI, IP_FRACTIONALIZER_ABI } from '../lib/contracts'
import { useMemo, useEffect } from 'react'
import { storyTestnet } from '../config/wagmi'

/**
 * Hook to fetch all IP assets from the registry
 */
export function useAllIPAssets() {
  const chainId = useChainId()
  const isCorrectChain = chainId === storyTestnet.id

  // First, get the total number of IP assets
  const { data: totalIPAssets, isLoading: isLoadingTotal, error: totalError, refetch: refetchTotal } = useReadContract({
    address: CONTRACT_ADDRESSES.IPAssetRegistry,
    abi: IP_ASSET_REGISTRY_ABI,
    functionName: 'totalIPAssets',
    query: {
      enabled: !!CONTRACT_ADDRESSES.IPAssetRegistry && isCorrectChain,
      refetchInterval: 10000, // Refetch every 10 seconds to catch new assets
    },
  })

  // Debug logging
  if (totalError) {
    console.error('Error fetching total IP assets:', totalError)
  }
  if (totalIPAssets !== undefined) {
    console.log('Total IP assets found:', Number(totalIPAssets))
  }
  if (!isCorrectChain) {
    console.warn('Not on Story Aeneid Testnet. Current chain:', chainId, 'Expected:', storyTestnet.id)
  }

  // Create contracts array for batch reading
  const contracts = useMemo(() => {
    if (!totalIPAssets || totalIPAssets === 0n) return []
    
    return Array.from({ length: Number(totalIPAssets) }, (_, i) => ({
      address: CONTRACT_ADDRESSES.IPAssetRegistry,
      abi: IP_ASSET_REGISTRY_ABI,
      functionName: 'getIPAsset' as const,
      args: [BigInt(i + 1)] as const,
    }))
  }, [totalIPAssets])

  // Batch read all IP assets
  const { data: ipAssetsData, isLoading: isLoadingAssets, error: ipAssetsError, refetch: refetchAssets } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0 && isCorrectChain,
      retry: 2,
      refetchInterval: (query) => {
        // Only refetch if we have assets and it's been more than 10 seconds
        return query.state.dataUpdateCount > 0 ? 10000 : false
      },
    },
  })

  // Also fetch fractionalization data for each asset
  const fractionalizationContracts = useMemo(() => {
    if (!totalIPAssets || totalIPAssets === 0n) return []
    
    return Array.from({ length: Number(totalIPAssets) }, (_, i) => ({
      address: CONTRACT_ADDRESSES.IPFractionalizer,
      abi: IP_FRACTIONALIZER_ABI,
      functionName: 'getFractionalization' as const,
      args: [BigInt(i + 1)] as const,
    }))
  }, [totalIPAssets])

  const { data: fractionalizationData, error: fractionalizationError, refetch: refetchFractionalization } = useReadContracts({
    contracts: fractionalizationContracts,
    query: {
      enabled: fractionalizationContracts.length > 0 && isCorrectChain,
      retry: 1, // Only retry once
    },
  })

  // Transform the data into a usable format
  const ipAssets = useMemo(() => {
    if (!ipAssetsData || !totalIPAssets) {
      return []
    }

    // Handle case where ipAssetsData might be undefined or empty
    if (!Array.isArray(ipAssetsData) || ipAssetsData.length === 0) {
      return []
    }

    const processed = ipAssetsData
      .map((result, index) => {
        // Handle both success and error cases
        if (result.status === 'error') {
          console.warn(`Failed to fetch IP Asset #${index + 1}:`, result.error)
          return null
        }

        if (!result.data || result.status !== 'success') {
          return null
        }

        const ipAsset = result.data as any
        
        // Validate that we have the expected structure
        if (!ipAsset || typeof ipAsset !== 'object') {
          return null
        }
        
        // Get fractionalization data if available (may fail for non-fractionalized assets)
        let fractionalization: any = null
        if (fractionalizationData && Array.isArray(fractionalizationData) && fractionalizationData[index]) {
          const fracResult = fractionalizationData[index]
          if (fracResult.status === 'success' && fracResult.data) {
            fractionalization = fracResult.data
          }
          // Silently ignore errors for fractionalization (asset might not be fractionalized)
        }

        // Convert IPFS URLs to gateway URLs if needed
        let imageUrl = ipAsset.metadataURI || ''
        if (imageUrl && imageUrl.startsWith('ipfs://')) {
          imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
        }

        return {
          id: String(ipAsset.id || index + 1),
          name: ipAsset.name || '',
          description: ipAsset.description || '',
          creator: ipAsset.creator || '',
          imageUrl: imageUrl,
          mintedAt: new Date(Number(ipAsset.mintedAt) * 1000),
          totalSupply: fractionalization?.totalSupply ? Number(fractionalization.totalSupply) : 0,
          fractionalized: ipAsset.fractionalized || false,
          royaltyRate: Number(ipAsset.royaltyRate || 0),
          allowDerivatives: ipAsset.allowDerivatives || false,
          allowCommercial: ipAsset.allowCommercial || false,
          fractionalOwnerRights: ipAsset.fractionalOwnerRights || '',
          pricePerFraction: fractionalization?.pricePerFraction 
            ? (Number(fractionalization.pricePerFraction) / 1e18).toFixed(6)
            : '0',
          sold: fractionalization?.sold ? Number(fractionalization.sold) : 0,
          active: fractionalization?.active || false,
        }
      })
      .filter((asset): asset is NonNullable<typeof asset> => asset !== null)
      .reverse() // Show newest first

    return processed
  }, [ipAssetsData, fractionalizationData, totalIPAssets])

  // Auto-refetch assets when total count changes (new asset minted)
  useEffect(() => {
    if (totalIPAssets && totalIPAssets > 0n && contracts.length > 0) {
      // If total count changed, refetch assets
      const currentCount = contracts.length
      const newCount = Number(totalIPAssets)
      
      if (newCount > currentCount) {
        console.log(`New IP asset detected! Total changed from ${currentCount} to ${newCount}. Refetching...`)
        refetchAssets()
        refetchFractionalization()
      }
    }
  }, [totalIPAssets, contracts.length, refetchAssets, refetchFractionalization])

  // Debug logging with useEffect to avoid re-renders
  useEffect(() => {
    if (ipAssetsData) {
      console.log('IP Assets data received:', ipAssetsData.length, 'items')
      console.log('Successfully parsed:', ipAssets.length, 'assets')
      if (ipAssets.length > 0) {
        console.log('Sample asset:', ipAssets[0])
      }
    }
  }, [ipAssetsData, ipAssets])

  // Refetch function that refreshes all data
  const refetch = async () => {
    await Promise.all([
      refetchTotal(),
      refetchAssets(),
      refetchFractionalization(),
    ])
  }

  return {
    ipAssets,
    totalIPAssets: totalIPAssets ? Number(totalIPAssets) : 0,
    isLoading: isLoadingTotal || isLoadingAssets,
    error: totalError || ipAssetsError || fractionalizationError,
    refetch,
  }
}

