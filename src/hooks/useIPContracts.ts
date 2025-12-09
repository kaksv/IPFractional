import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import {
  CONTRACT_ADDRESSES,
  IP_ASSET_REGISTRY_ABI,
  IP_FRACTIONALIZER_ABI,
  ROYALTY_DISTRIBUTOR_ABI,
  IP_MARKETPLACE_ABI,
  IP_GOVERNANCE_ABI,
} from '../lib/contracts'
import { storyTestnet } from '../config/wagmi'

// Hook for minting IP Assets
export function useMintIPAsset() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
  const chainId = useChainId()

  const mint = async (
    name: string,
    description: string,
    metadataURI: string,
    royaltyRate: number,
    allowDerivatives: boolean,
    allowCommercial: boolean,
    fractionalOwnerRights: string
  ) => {
    if (!CONTRACT_ADDRESSES.IPAssetRegistry) {
      throw new Error('IPAssetRegistry address not configured')
    }

    // Ensure we're on Story Aeneid Testnet (chain ID 1315)
    // This prevents minting on Base, Ethereum, or any other network
    if (chainId !== storyTestnet.id) {
      throw new Error(`Please switch to Story Aeneid Testnet (Chain ID: ${storyTestnet.id}) to mint IP assets. You are currently on chain ID: ${chainId}`)
    }

    return writeContract({
      address: CONTRACT_ADDRESSES.IPAssetRegistry,
      abi: IP_ASSET_REGISTRY_ABI,
      functionName: 'mintIPAsset',
      args: [name, description, metadataURI, BigInt(royaltyRate), allowDerivatives, allowCommercial, fractionalOwnerRights],
    })
  }

  return { mint, hash, isPending, isConfirming, isConfirmed, error }
}

// Hook for fractionalizing IP Assets
export function useFractionalizeIP() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const fractionalize = async (
    ipAssetId: bigint,
    totalSupply: bigint,
    pricePerFraction: string // In IP
  ) => {
    if (!CONTRACT_ADDRESSES.IPFractionalizer) {
      throw new Error('IPFractionalizer address not configured')
    }

    return writeContract({
      address: CONTRACT_ADDRESSES.IPFractionalizer,
      abi: IP_FRACTIONALIZER_ABI,
      functionName: 'fractionalize',
      args: [ipAssetId, totalSupply, parseEther(pricePerFraction)],
    })
  }

  return { fractionalize, hash, isPending, isConfirming, isConfirmed, error }
}

// Hook for purchasing fractions
export function usePurchaseFractions() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const purchase = async (ipAssetId: bigint, amount: bigint, pricePerFraction: string) => {
    if (!CONTRACT_ADDRESSES.IPFractionalizer) {
      throw new Error('IPFractionalizer address not configured')
    }

    const totalCost = parseEther(pricePerFraction) * amount

    return writeContract({
      address: CONTRACT_ADDRESSES.IPFractionalizer,
      abi: IP_FRACTIONALIZER_ABI,
      functionName: 'purchaseFractions',
      args: [ipAssetId, amount],
      value: totalCost,
    })
  }

  return { purchase, hash, isPending, isConfirming, isConfirmed, error }
}

// Hook for reading IP Asset data
export function useIPAsset(ipAssetId: bigint | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.IPAssetRegistry,
    abi: IP_ASSET_REGISTRY_ABI,
    functionName: 'getIPAsset',
    args: ipAssetId ? [ipAssetId] : undefined,
    query: {
      enabled: !!ipAssetId && !!CONTRACT_ADDRESSES.IPAssetRegistry,
    },
  })

  return { ipAsset: data, isLoading, error }
}

// Hook for reading fractionalization data
export function useFractionalization(ipAssetId: bigint | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.IPFractionalizer as `0x${string}`,
    abi: IP_FRACTIONALIZER_ABI,
    functionName: 'getFractionalization',
    args: ipAssetId ? [ipAssetId] : undefined,
    query: {
      enabled: !!ipAssetId && !!CONTRACT_ADDRESSES.IPFractionalizer,
    },
  })

  return { fractionalization: data, isLoading, error }
}

// Hook for reading user's fraction balance
export function useFractionBalance(ipAssetId: bigint | undefined, owner: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.IPFractionalizer as `0x${string}`,
    abi: IP_FRACTIONALIZER_ABI,
    functionName: 'getFractionBalance',
    args: ipAssetId && owner ? [ipAssetId, owner] : undefined,
    query: {
      enabled: !!ipAssetId && !!owner && !!CONTRACT_ADDRESSES.IPFractionalizer,
    },
  })

  return { balance: data, isLoading, error }
}

// Hook for claiming royalties
export function useClaimRoyalties() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const claim = async (ipAssetId: bigint) => {
    if (!CONTRACT_ADDRESSES.RoyaltyDistributor) {
      throw new Error('RoyaltyDistributor address not configured')
    }

    return writeContract({
      address: CONTRACT_ADDRESSES.RoyaltyDistributor,
      abi: ROYALTY_DISTRIBUTOR_ABI,
      functionName: 'claimRoyalties',
      args: [ipAssetId],
    })
  }

  return { claim, hash, isPending, isConfirming, isConfirmed, error }
}

// Hook for reading claimable royalties
export function useClaimableRoyalties(ipAssetId: bigint | undefined, owner: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.RoyaltyDistributor,
    abi: ROYALTY_DISTRIBUTOR_ABI,
    functionName: 'getClaimableRoyalties',
    args: ipAssetId && owner ? [ipAssetId, owner] : undefined,
    query: {
      enabled: !!ipAssetId && !!owner && !!CONTRACT_ADDRESSES.RoyaltyDistributor,
    },
  })

  return { claimable: data ? formatEther(data) : '0', isLoading, error }
}

// Hook for creating marketplace listings
export function useCreateListing() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const createListing = async (
    ipAssetId: bigint,
    amount: bigint,
    pricePerToken: string
  ) => {
    if (!CONTRACT_ADDRESSES.IPMarketplace) {
      throw new Error('IPMarketplace address not configured')
    }

    return writeContract({
      address: CONTRACT_ADDRESSES.IPMarketplace,
      abi: IP_MARKETPLACE_ABI,
      functionName: 'createListing',
      args: [ipAssetId, amount, parseEther(pricePerToken)],
    })
  }

  return { createListing, hash, isPending, isConfirming, isConfirmed, error }
}

// Hook for governance voting
export function useVote() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const vote = async (proposalId: bigint, support: boolean) => {
    if (!CONTRACT_ADDRESSES.IPGovernance) {
      throw new Error('IPGovernance address not configured')
    }

    return writeContract({
      address: CONTRACT_ADDRESSES.IPGovernance,
      abi: IP_GOVERNANCE_ABI,
      functionName: 'vote',
      args: [proposalId, support],
    })
  }

  return { vote, hash, isPending, isConfirming, isConfirmed, error }
}

// Hook for creating governance proposals
export function useCreateProposal() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const createProposal = async (
    ipAssetId: bigint,
    title: string,
    description: string,
    votingPeriod: bigint // in seconds
  ) => {
    if (!CONTRACT_ADDRESSES.IPGovernance) {
      throw new Error('IPGovernance address not configured')
    }

    return writeContract({
      address: CONTRACT_ADDRESSES.IPGovernance,
      abi: IP_GOVERNANCE_ABI,
      functionName: 'createProposal',
      args: [ipAssetId, title, description, votingPeriod],
    })
  }

  return { createProposal, hash, isPending, isConfirming, isConfirmed, error }
}

// Hook for reading governance proposals
export function useProposal(proposalId: bigint | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.IPGovernance,
    abi: IP_GOVERNANCE_ABI,
    functionName: 'getProposal',
    args: proposalId ? [proposalId] : undefined,
    query: {
      enabled: !!proposalId && !!CONTRACT_ADDRESSES.IPGovernance,
    },
  })

  return { proposal: data, isLoading, error }
}

// Hook for fetching all proposals for an IP asset
export function useIPAssetProposals(ipAssetId: bigint | undefined) {
  const { data: proposalIds, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.IPGovernance,
    abi: IP_GOVERNANCE_ABI,
    functionName: 'getIPAssetProposals',
    args: ipAssetId ? [ipAssetId] : undefined,
    query: {
      enabled: !!ipAssetId && !!CONTRACT_ADDRESSES.IPGovernance,
    },
  })

  return { proposalIds: proposalIds as bigint[] | undefined, isLoading, error }
}

