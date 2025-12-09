// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IPAssetRegistry
 * @dev Registry for Intellectual Property Assets on Story Protocol
 * Each IP Asset represents a creative work (story, character, song, etc.)
 */

// The Contract address of the Deployed Contract on the Aeneid Testnet is 0x3d3212874efB3E770597716d72518c9649FBDAA6
contract IPAssetRegistry is Ownable, ReentrancyGuard {
    struct IPAsset {
        uint256 id;
        string name;
        string description;
        string metadataURI; // IPFS or other decentralized storage URI
        address creator;
        uint256 mintedAt;
        bool fractionalized;
        uint256 royaltyRate; // Percentage (0-100) for creator
        bool allowDerivatives;
        bool allowCommercial;
        string fractionalOwnerRights; // "voting", "revenue", "both"
    }

    // Mapping from IP Asset ID to IP Asset
    mapping(uint256 => IPAsset) public ipAssets;
    
    // Mapping from creator to their IP Assets
    mapping(address => uint256[]) public creatorIPAssets;
    
    // Total number of IP Assets minted
    uint256 public totalIPAssets;
    
    // Events
    event IPAssetMinted(
        uint256 indexed ipAssetId,
        address indexed creator,
        string name,
        string metadataURI,
        uint256 royaltyRate
    );
    
    event IPAssetUpdated(
        uint256 indexed ipAssetId,
        string metadataURI
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Mint a new IP Asset
     * @param name Name of the IP Asset
     * @param description Description of the IP Asset
     * @param metadataURI URI pointing to metadata (IPFS, Arweave, etc.)
     * @param royaltyRate Percentage (0-100) of revenue that goes to creator
     * @param allowDerivatives Whether derivative works are allowed
     * @param allowCommercial Whether commercial use is allowed
     * @param fractionalOwnerRights Rights for fractional owners
     */
    function mintIPAsset(
        string memory name,
        string memory description,
        string memory metadataURI,
        uint256 royaltyRate,
        bool allowDerivatives,
        bool allowCommercial,
        string memory fractionalOwnerRights
    ) external nonReentrant returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(royaltyRate <= 100, "Royalty rate cannot exceed 100%");
        
        totalIPAssets++;
        uint256 ipAssetId = totalIPAssets;
        
        ipAssets[ipAssetId] = IPAsset({
            id: ipAssetId,
            name: name,
            description: description,
            metadataURI: metadataURI,
            creator: msg.sender,
            mintedAt: block.timestamp,
            fractionalized: false,
            royaltyRate: royaltyRate,
            allowDerivatives: allowDerivatives,
            allowCommercial: allowCommercial,
            fractionalOwnerRights: fractionalOwnerRights
        });
        
        creatorIPAssets[msg.sender].push(ipAssetId);
        
        emit IPAssetMinted(ipAssetId, msg.sender, name, metadataURI, royaltyRate);
        
        return ipAssetId;
    }

    /**
     * @dev Mark an IP Asset as fractionalized
     * @param ipAssetId The ID of the IP Asset
     */
    function markAsFractionalized(uint256 ipAssetId) external {
        require(ipAssets[ipAssetId].creator != address(0), "IP Asset does not exist");
        // Only the fractionalizer contract should call this
        // In production, add access control
        ipAssets[ipAssetId].fractionalized = true;
    }

    /**
     * @dev Get IP Asset details
     * @param ipAssetId The ID of the IP Asset
     */
    function getIPAsset(uint256 ipAssetId) external view returns (IPAsset memory) {
        require(ipAssets[ipAssetId].creator != address(0), "IP Asset does not exist");
        return ipAssets[ipAssetId];
    }

    /**
     * @dev Get all IP Assets created by an address
     * @param creator The creator's address
     */
    function getCreatorIPAssets(address creator) external view returns (uint256[] memory) {
        return creatorIPAssets[creator];
    }

    /**
     * @dev Update IP Asset metadata
     * @param ipAssetId The ID of the IP Asset
     * @param metadataURI New metadata URI
     */
    function updateMetadata(uint256 ipAssetId, string memory metadataURI) external {
        require(ipAssets[ipAssetId].creator == msg.sender, "Only creator can update");
        ipAssets[ipAssetId].metadataURI = metadataURI;
        emit IPAssetUpdated(ipAssetId, metadataURI);
    }
}

