import { useParams, Link } from 'react-router-dom'
import { useAccount, useReadContracts } from 'wagmi'
import { useState, useMemo, useEffect } from 'react'
import { Vote, CheckCircle, XCircle, Clock, Plus, Loader2, AlertCircle, FileText, ShoppingBag, LayoutDashboard } from 'lucide-react'
import { useIPAssetProposals, useVote, useCreateProposal, useFractionBalance, useIPAsset } from '../hooks/useIPContracts'
import { CONTRACT_ADDRESSES, IP_GOVERNANCE_ABI } from '../lib/contracts'
import { GovernanceProposal } from '../types'
import { useStoryChain } from '../hooks/useStoryChain'

export default function Governance() {
  const { id } = useParams<{ id: string }>()
  const { address, isConnected } = useAccount()
  const { isCorrectChain } = useStoryChain()
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null)
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    votingPeriod: '7', // days
  })

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
  const { ipAsset: ipAssetData } = useIPAsset(ipAssetId)

  // Fetch proposal IDs for this IP asset
  const { proposalIds, isLoading: isLoadingProposalIds } = useIPAssetProposals(ipAssetId)

  // Fetch all proposals
  const proposalContracts = useMemo(() => {
    if (!proposalIds || proposalIds.length === 0) return []
    return proposalIds.map(proposalId => ({
      address: CONTRACT_ADDRESSES.IPGovernance,
      abi: IP_GOVERNANCE_ABI,
      functionName: 'getProposal' as const,
      args: [proposalId] as const,
    }))
  }, [proposalIds])

  const { data: proposalsData, isLoading: isLoadingProposals, refetch: refetchProposals } = useReadContracts({
    contracts: proposalContracts,
    query: {
      enabled: proposalContracts.length > 0,
    },
  })

  // Transform proposals data
  const proposals = useMemo(() => {
    if (!proposalsData || !Array.isArray(proposalsData)) return []

    return proposalsData
      .map((result, index) => {
        if (result.status !== 'success' || !result.result) return null
        const data = result.result as readonly [bigint, bigint, string, string, `0x${string}`, bigint, bigint, bigint, bigint, boolean]

        return {
          id: String(proposalIds?.[index] || index + 1),
          ipAssetId: id || '',
          title: data[2] || '',
          description: data[3] || '',
          proposer: data[4] || '',
          votesFor: Number(data[5] || 0),
          votesAgainst: Number(data[6] || 0),
          startTime: new Date(Number(data[7] || 0) * 1000),
          endTime: new Date(Number(data[8] || 0) * 1000),
          executed: data[9] || false,
        } as GovernanceProposal
      })
      .filter((p): p is GovernanceProposal => p !== null)
      .reverse() // Show newest first
  }, [proposalsData, proposalIds, id])

  // Get user's voting power (token balance)
  const { balance: userBalance } = useFractionBalance(ipAssetId, address)

  // Voting hook
  const { vote, isPending: isVoting, isConfirming: isConfirmingVote, isConfirmed: isVoteConfirmed, error: voteError } = useVote()

  // Create proposal hook
  const { createProposal, isPending: isCreating, isConfirming: isConfirmingCreate, isConfirmed: isCreateConfirmed, error: createError } = useCreateProposal()

  // Refetch proposals after successful vote or create
  useEffect(() => {
    if (isVoteConfirmed || isCreateConfirmed) {
      refetchProposals()
      setSelectedProposal(null)
      setVoteChoice(null)
      setShowCreateForm(false)
      setNewProposal({ title: '', description: '', votingPeriod: '7' })
    }
  }, [isVoteConfirmed, isCreateConfirmed, refetchProposals])

  const handleVote = async (proposalId: string) => {
    if (!isConnected) {
      alert('Please connect your wallet')
      return
    }
    if (!isCorrectChain) {
      alert('Please switch to Story Aeneid Testnet')
      return
    }
    if (!voteChoice || !ipAssetId) {
      alert('Please select a vote choice')
      return
    }

    try {
      await vote(BigInt(proposalId), voteChoice === 'for')
    } catch (error: any) {
      console.error('Vote error:', error)
      alert(error?.message || 'Failed to vote')
    }
  }

  const handleCreateProposal = async () => {
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
    if (!newProposal.title || !newProposal.description) {
      alert('Please fill in all fields')
      return
    }

    // Convert voting period from days to seconds
    const votingPeriodSeconds = BigInt(Number(newProposal.votingPeriod) * 24 * 60 * 60)

    try {
      await createProposal(ipAssetId, newProposal.title, newProposal.description, votingPeriodSeconds)
    } catch (error: any) {
      console.error('Create proposal error:', error)
      alert(error?.message || 'Failed to create proposal')
    }
  }

  const getProposalStatus = (proposal: GovernanceProposal) => {
    const now = new Date()
    if (proposal.executed) return 'executed'
    if (now < proposal.startTime) return 'upcoming'
    if (now > proposal.endTime) return 'ended'
    return 'active'
  }

  const isLoading = isLoadingProposalIds || isLoadingProposals
  const userVotingPower = userBalance ? Number(userBalance) : 0

  // If no IP asset ID, show a message to select one
  if (!id) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Vote className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Governance</h1>
            <p className="text-gray-400 mt-1">Select an IP Asset to view governance</p>
          </div>
        </div>
        <div className="card text-center py-16">
          <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">No IP Asset Selected</h2>
          <p className="text-gray-400 mb-6">
            To participate in governance, please select an IP Asset from the marketplace or your dashboard.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/marketplace" className="btn-primary">
              <ShoppingBag className="h-4 w-4" />
              <span>Browse Marketplace</span>
            </Link>
            {isConnected && (
              <Link to="/dashboard" className="btn-secondary">
                <LayoutDashboard className="h-4 w-4" />
                <span>View Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Vote className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Governance</h1>
            {ipAssetData && (
              <p className="text-gray-400 mt-1">IP Asset: {(ipAssetData as any).name || `#${id}`}</p>
            )}
          </div>
        </div>
        {isConnected && isCorrectChain && userVotingPower > 0 && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Create Proposal</span>
          </button>
        )}
      </div>

      {!isConnected && (
        <div className="card-dark border-l-4 border-yellow-400/50 mb-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <p className="text-white">Please connect your wallet to participate in governance.</p>
          </div>
        </div>
      )}

      {isConnected && userVotingPower === 0 && (
        <div className="card-dark border-l-4 border-blue-400/50 mb-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-400" />
            <p className="text-white">You need to own fractional tokens to create or vote on proposals.</p>
            <Link to={`/ip/${id}`} className="btn-secondary text-sm ml-auto">
              Purchase Tokens
            </Link>
          </div>
        </div>
      )}

      {/* Create Proposal Form */}
      {showCreateForm && isConnected && userVotingPower > 0 && (
        <div className="card mb-8 animate-slide-up">
          <h2 className="text-2xl font-bold mb-6 text-white">Create New Proposal</h2>
          
          {createError && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-sm">{createError.message || 'Failed to create proposal'}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={newProposal.title}
                onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                className="input-field"
                placeholder="Enter proposal title"
                disabled={isCreating || isConfirmingCreate}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={newProposal.description}
                onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                className="input-field min-h-[120px] resize-none"
                placeholder="Describe your proposal in detail..."
                disabled={isCreating || isConfirmingCreate}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Voting Period (days)</label>
              <input
                type="number"
                min="7"
                value={newProposal.votingPeriod}
                onChange={(e) => setNewProposal({ ...newProposal, votingPeriod: e.target.value })}
                className="input-field"
                placeholder="7"
                disabled={isCreating || isConfirmingCreate}
              />
              <p className="text-xs text-gray-400 mt-1">Minimum: 7 days</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewProposal({ title: '', description: '', votingPeriod: '7' })
                }}
                className="btn-secondary flex-1"
                disabled={isCreating || isConfirmingCreate}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProposal}
                disabled={isCreating || isConfirmingCreate || !newProposal.title || !newProposal.description}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating || isConfirmingCreate ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isConfirmingCreate ? 'Confirming...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>Create Proposal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposals List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : proposals.length === 0 ? (
        <div className="card text-center py-16">
          <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No governance proposals yet.</p>
          {isConnected && userVotingPower > 0 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary mt-4"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Proposal</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal, index) => {
            const status = getProposalStatus(proposal)
            const totalVotes = proposal.votesFor + proposal.votesAgainst
            const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0

            return (
              <div key={proposal.id} className="card glow-effect animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-white">{proposal.title}</h3>
                    <p className="text-gray-400 mb-4 leading-relaxed">{proposal.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Proposed by: <span className="text-white font-mono">{proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span></span>
                      <span>•</span>
                      <span>
                        {proposal.startTime.toLocaleDateString()} - {proposal.endTime.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {status === 'active' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        <Clock className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    )}
                    {status === 'ended' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                        Ended
                      </span>
                    )}
                    {status === 'executed' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Executed
                      </span>
                    )}
                  </div>
                </div>

                {/* Vote Results */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-400 font-medium">
                      For: {proposal.votesFor.toLocaleString()} votes ({forPercentage.toFixed(1)}%)
                    </span>
                    <span className="text-red-400 font-medium">
                      Against: {proposal.votesAgainst.toLocaleString()} votes ({(100 - forPercentage).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${forPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Voting Power Display */}
                {isConnected && userVotingPower > 0 && (
                  <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-sm text-gray-400">
                      Your Voting Power: <span className="text-white font-semibold">{userVotingPower.toLocaleString()} tokens</span>
                    </p>
                  </div>
                )}

                {/* Vote Button */}
                {status === 'active' && isConnected && userVotingPower > 0 && (
                  <div>
                    {selectedProposal === proposal.id ? (
                      <div className="space-y-3">
                        {voteError && (
                          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                            <p className="text-red-400 text-sm">{voteError.message || 'Vote failed'}</p>
                          </div>
                        )}
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setVoteChoice('for')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                              voteChoice === 'for'
                                ? 'bg-green-500 text-white border-2 border-green-400'
                                : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                            }`}
                          >
                            <CheckCircle className="inline h-4 w-4 mr-2" />
                            Vote For
                          </button>
                          <button
                            onClick={() => setVoteChoice('against')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                              voteChoice === 'against'
                                ? 'bg-red-500 text-white border-2 border-red-400'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                            }`}
                          >
                            <XCircle className="inline h-4 w-4 mr-2" />
                            Vote Against
                          </button>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setSelectedProposal(null)
                              setVoteChoice(null)
                            }}
                            className="flex-1 btn-secondary"
                            disabled={isVoting || isConfirmingVote}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleVote(proposal.id)}
                            disabled={!voteChoice || isVoting || isConfirmingVote}
                            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isVoting || isConfirmingVote ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{isConfirmingVote ? 'Confirming...' : 'Submitting...'}</span>
                              </>
                            ) : (
                              'Submit Vote'
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedProposal(proposal.id)}
                        className="btn-primary w-full"
                      >
                        <Vote className="h-4 w-4" />
                        <span>Vote on This Proposal</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
