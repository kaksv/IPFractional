export interface IPAsset {
  id: string
  name: string
  description: string
  creator: string
  imageUrl?: string
  mintedAt: Date
  totalSupply: number
  fractionalized: boolean
  royaltyRate: number // Percentage (0-100)
}

export interface FractionalToken {
  tokenId: string
  ipAssetId: string
  owner: string
  amount: number // Number of tokens owned
  percentage: number // Ownership percentage
}

export interface IPListing {
  id: string
  ipAssetId: string
  totalSupply: number
  pricePerFraction: string // In wei/IP
  saleMethod: 'fixed' | 'dutch' | 'ito' // Initial Token Offering
  startTime: Date
  endTime?: Date
  sold: number
  remaining: number
}

export interface RoyaltyDistribution {
  ipAssetId: string
  totalRevenue: string // In wei/IP
  creatorShare: string
  fractionalOwnersShare: string
  distributions: {
    address: string
    amount: string
    percentage: number
  }[]
  timestamp: Date
}

export interface GovernanceProposal {
  id: string
  ipAssetId: string
  title: string
  description: string
  proposer: string
  votesFor: number
  votesAgainst: number
  startTime: Date
  endTime: Date
  executed: boolean
}

export interface LicenseRequest {
  id: string
  ipAssetId: string
  requester: string
  purpose: string
  fee: string
  status: 'pending' | 'approved' | 'rejected'
  timestamp: Date
}

