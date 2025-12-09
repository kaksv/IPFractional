// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IPFractionalizer.sol";

/**
 * @title IPGovernance
 * @dev Governance contract for fractional IP token holders to vote on proposals
 */
contract IPGovernance is Ownable, ReentrancyGuard {
    IPFractionalizer public ipFractionalizer;
    
    struct Proposal {
        uint256 proposalId;
        uint256 ipAssetId;
        string title;
        string description;
        address proposer;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => bool) votedFor; // true if voted for, false if against
    }
    
    // Mapping from proposal ID to proposal
    mapping(uint256 => Proposal) public proposals;
    
    // Mapping from IP Asset ID to proposal IDs
    mapping(uint256 => uint256[]) public ipAssetProposals;
    
    // Next proposal ID
    uint256 private _nextProposalId = 1;
    
    // Minimum voting period (in seconds)
    uint256 public minVotingPeriod = 7 days;
    
    // Minimum quorum (in basis points, e.g., 1000 = 10%)
    uint256 public minQuorum = 1000; // 10%
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed ipAssetId,
        address indexed proposer,
        string title
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _ipFractionalizer) Ownable(msg.sender) {
        ipFractionalizer = IPFractionalizer(_ipFractionalizer);
    }

    /**
     * @dev Create a new governance proposal
     * @param ipAssetId The ID of the IP Asset
     * @param title Title of the proposal
     * @param description Description of the proposal
     * @param votingPeriod Voting period in seconds
     */
    function createProposal(
        uint256 ipAssetId,
        string memory title,
        string memory description,
        uint256 votingPeriod
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(votingPeriod >= minVotingPeriod, "Voting period too short");
        
        // Check that proposer owns at least some fractions
        uint256 balance = ipFractionalizer.getFractionBalance(ipAssetId, msg.sender);
        require(balance > 0, "Must own fractions to create proposal");
        
        uint256 proposalId = _nextProposalId++;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.ipAssetId = ipAssetId;
        proposal.title = title;
        proposal.description = description;
        proposal.proposer = msg.sender;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + votingPeriod;
        proposal.executed = false;
        
        ipAssetProposals[ipAssetId].push(proposalId);
        
        emit ProposalCreated(proposalId, ipAssetId, msg.sender, title);
        
        return proposalId;
    }

    /**
     * @dev Vote on a proposal
     * @param proposalId The ID of the proposal
     * @param support true for yes, false for no
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        
        // Get voter's token balance (voting weight)
        uint256 balance = ipFractionalizer.getFractionBalance(proposal.ipAssetId, msg.sender);
        require(balance > 0, "Must own fractions to vote");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votedFor[msg.sender] = support;
        
        if (support) {
            proposal.votesFor += balance;
        } else {
            proposal.votesAgainst += balance;
        }
        
        emit VoteCast(proposalId, msg.sender, support, balance);
    }

    /**
     * @dev Execute a proposal (if it passed)
     * @param proposalId The ID of the proposal
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting still active");
        require(!proposal.executed, "Proposal already executed");
        
        // Get total supply for quorum calculation
        IPFractionalizer.Fractionalization memory frac = ipFractionalizer.getFractionalization(proposal.ipAssetId);
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 quorum = (totalVotes * 10000) / frac.totalSupply;
        
        require(quorum >= minQuorum, "Quorum not met");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal did not pass");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
        
        // In a real implementation, you would execute the proposal's action here
        // For example, calling a function on another contract
    }

    /**
     * @dev Get proposal details
     * @param proposalId The ID of the proposal
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 proposalId_,
        uint256 ipAssetId,
        string memory title,
        string memory description,
        address proposer,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 startTime,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposalId,
            proposal.ipAssetId,
            proposal.title,
            proposal.description,
            proposal.proposer,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.startTime,
            proposal.endTime,
            proposal.executed
        );
    }

    /**
     * @dev Get all proposals for an IP Asset
     * @param ipAssetId The ID of the IP Asset
     */
    function getIPAssetProposals(uint256 ipAssetId) external view returns (uint256[] memory) {
        return ipAssetProposals[ipAssetId];
    }

    /**
     * @dev Check if an address has voted on a proposal
     * @param proposalId The ID of the proposal
     * @param voter The address to check
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }

    /**
     * @dev Get vote choice for an address
     * @param proposalId The ID of the proposal
     * @param voter The address to check
     */
    function getVoteChoice(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].votedFor[voter];
    }

    /**
     * @dev Set minimum voting period (only owner)
     * @param newPeriod New minimum period in seconds
     */
    function setMinVotingPeriod(uint256 newPeriod) external onlyOwner {
        minVotingPeriod = newPeriod;
    }

    /**
     * @dev Set minimum quorum (only owner)
     * @param newQuorum New quorum in basis points
     */
    function setMinQuorum(uint256 newQuorum) external onlyOwner {
        require(newQuorum <= 10000, "Quorum cannot exceed 100%");
        minQuorum = newQuorum;
    }
}

