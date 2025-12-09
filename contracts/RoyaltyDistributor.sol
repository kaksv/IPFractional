// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IPAssetRegistry.sol";
import "./IPFractionalizer.sol";

/**
 * @title RoyaltyDistributor
 * @dev Automatically distributes licensing revenue to creator and fractional owners
 */
contract RoyaltyDistributor is Ownable, ReentrancyGuard {
    IPAssetRegistry public ipAssetRegistry;
    IPFractionalizer public ipFractionalizer;
    
    struct RoyaltyDistribution {
        uint256 ipAssetId;
        uint256 totalRevenue;
        uint256 creatorShare;
        uint256 fractionalOwnersShare;
        uint256 timestamp;
    }
    
    // Mapping from IP Asset ID to accumulated royalties
    mapping(uint256 => uint256) public accumulatedRoyalties;
    
    // Mapping from IP Asset ID to distribution history
    mapping(uint256 => RoyaltyDistribution[]) public distributionHistory;
    
    // Mapping from (ipAssetId, address) to claimable amount
    mapping(uint256 => mapping(address => uint256)) public claimableRoyalties;
    
    // Events
    event RoyaltyReceived(
        uint256 indexed ipAssetId,
        uint256 amount,
        address indexed payer
    );
    
    event RoyaltyDistributed(
        uint256 indexed ipAssetId,
        uint256 creatorShare,
        uint256 fractionalOwnersShare
    );
    
    event RoyaltyClaimed(
        uint256 indexed ipAssetId,
        address indexed recipient,
        uint256 amount
    );

    constructor(address _ipAssetRegistry, address _ipFractionalizer) Ownable(msg.sender) {
        ipAssetRegistry = IPAssetRegistry(_ipAssetRegistry);
        ipFractionalizer = IPFractionalizer(_ipFractionalizer);
    }

    /**
     * @dev Receive licensing payment and distribute royalties
     * @param ipAssetId The ID of the IP Asset being licensed
     */
    function receiveRoyalty(uint256 ipAssetId) external payable nonReentrant {
        require(msg.value > 0, "Payment must be greater than 0");
        
        IPAssetRegistry.IPAsset memory ipAsset = ipAssetRegistry.getIPAsset(ipAssetId);
        require(ipAsset.creator != address(0), "IP Asset does not exist");
        
        accumulatedRoyalties[ipAssetId] += msg.value;
        
        emit RoyaltyReceived(ipAssetId, msg.value, msg.sender);
        
        // Automatically distribute if IP is fractionalized
        if (ipAsset.fractionalized) {
            _distributeRoyalty(ipAssetId, msg.value);
        } else {
            // If not fractionalized, all goes to creator
            claimableRoyalties[ipAssetId][ipAsset.creator] += msg.value;
        }
    }

    /**
     * @dev Distribute royalty according to configured rates
     * @param ipAssetId The ID of the IP Asset
     * @param amount The amount to distribute
     */
    function _distributeRoyalty(uint256 ipAssetId, uint256 amount) internal {
        IPAssetRegistry.IPAsset memory ipAsset = ipAssetRegistry.getIPAsset(ipAssetId);
        
        uint256 creatorShare = (amount * ipAsset.royaltyRate) / 100;
        uint256 fractionalOwnersShare = amount - creatorShare;
        
        // Add to creator's claimable
        claimableRoyalties[ipAssetId][ipAsset.creator] += creatorShare;
        
        // Distribute to fractional owners based on their ownership
        // This is a simplified version - in production, you'd want to iterate through all holders
        // For gas efficiency, we'll use a pull model where users claim their share
        
        // Store distribution record
        distributionHistory[ipAssetId].push(RoyaltyDistribution({
            ipAssetId: ipAssetId,
            totalRevenue: amount,
            creatorShare: creatorShare,
            fractionalOwnersShare: fractionalOwnersShare,
            timestamp: block.timestamp
        }));
        
        emit RoyaltyDistributed(ipAssetId, creatorShare, fractionalOwnersShare);
    }

    /**
     * @dev Calculate and update claimable royalties for a fractional owner
     * @param ipAssetId The ID of the IP Asset
     * @param owner The address of the fractional owner
     */
    function updateClaimableRoyalties(uint256 ipAssetId, address owner) external {
        IPAssetRegistry.IPAsset memory ipAsset = ipAssetRegistry.getIPAsset(ipAssetId);
        require(ipAsset.fractionalized, "IP Asset not fractionalized");
        
        // Get ownership percentage (returns value with 2 decimal precision)
        uint256 ownershipPercentage = ipFractionalizer.getOwnershipPercentage(ipAssetId, owner);
        
        // Calculate share from all distributions since last claim
        uint256 totalClaimable = 0;
        RoyaltyDistribution[] memory distributions = distributionHistory[ipAssetId];
        
        for (uint256 i = 0; i < distributions.length; i++) {
            // Calculate owner's share of fractional owners' portion
            uint256 ownerShare = (distributions[i].fractionalOwnersShare * ownershipPercentage) / 10000;
            totalClaimable += ownerShare;
        }
        
        claimableRoyalties[ipAssetId][owner] = totalClaimable;
    }

    /**
     * @dev Claim accumulated royalties
     * @param ipAssetId The ID of the IP Asset
     */
    function claimRoyalties(uint256 ipAssetId) external nonReentrant {
        // Update claimable amount first
        if (ipAssetRegistry.getIPAsset(ipAssetId).fractionalized) {
            updateClaimableRoyalties(ipAssetId, msg.sender);
        }
        
        uint256 amount = claimableRoyalties[ipAssetId][msg.sender];
        require(amount > 0, "No royalties to claim");
        
        claimableRoyalties[ipAssetId][msg.sender] = 0;
        accumulatedRoyalties[ipAssetId] -= amount;
        
        payable(msg.sender).transfer(amount);
        
        emit RoyaltyClaimed(ipAssetId, msg.sender, amount);
    }

    /**
     * @dev Get claimable royalties for an address
     * @param ipAssetId The ID of the IP Asset
     * @param owner The address to check
     */
    function getClaimableRoyalties(uint256 ipAssetId, address owner) external view returns (uint256) {
        return claimableRoyalties[ipAssetId][owner];
    }

    /**
     * @dev Get distribution history for an IP Asset
     * @param ipAssetId The ID of the IP Asset
     */
    function getDistributionHistory(uint256 ipAssetId) external view returns (RoyaltyDistribution[] memory) {
        return distributionHistory[ipAssetId];
    }
}

