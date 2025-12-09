// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IPAssetRegistry.sol";

/**
 * @title IPFractionalizer
 * @dev ERC-1155 contract for fractionalizing IP Assets into tradeable tokens
 * Each IP Asset can be split into a configurable number of fractional tokens
 */
contract IPFractionalizer is ERC1155, Ownable, ReentrancyGuard {
    IPAssetRegistry public ipAssetRegistry;
    
    struct Fractionalization {
        uint256 ipAssetId;
        uint256 totalSupply;
        uint256 pricePerFraction; // In wei
        address creator;
        bool active;
        uint256 sold;
    }
    
    // Mapping from IP Asset ID to fractionalization details
    mapping(uint256 => Fractionalization) public fractionalizations;
    
    // Mapping from IP Asset ID to token ID (for ERC-1155)
    mapping(uint256 => uint256) public ipAssetToTokenId;
    
    // Next token ID for ERC-1155
    uint256 private _nextTokenId = 1;
    
    // Events
    event IPFractionalized(
        uint256 indexed ipAssetId,
        uint256 indexed tokenId,
        uint256 totalSupply,
        address indexed creator
    );
    
    event FractionsPurchased(
        uint256 indexed ipAssetId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPaid
    );
    
    event FractionsTransferred(
        uint256 indexed ipAssetId,
        address indexed from,
        address indexed to,
        uint256 amount
    );

    constructor(address _ipAssetRegistry) ERC1155("") Ownable(msg.sender) {
        ipAssetRegistry = IPAssetRegistry(_ipAssetRegistry);
    }

    /**
     * @dev Fractionalize an IP Asset
     * @param ipAssetId The ID of the IP Asset to fractionalize
     * @param totalSupply Total number of fractional tokens to create
     * @param pricePerFraction Price per fraction in wei
     */
    function fractionalize(
        uint256 ipAssetId,
        uint256 totalSupply,
        uint256 pricePerFraction
    ) external nonReentrant returns (uint256) {
        // Verify IP Asset exists and caller is creator
        IPAssetRegistry.IPAsset memory ipAsset = ipAssetRegistry.getIPAsset(ipAssetId);
        require(ipAsset.creator == msg.sender, "Only creator can fractionalize");
        require(!ipAsset.fractionalized, "IP Asset already fractionalized");
        require(totalSupply > 0, "Total supply must be greater than 0");
        
        uint256 tokenId = _nextTokenId++;
        ipAssetToTokenId[ipAssetId] = tokenId;
        
        fractionalizations[ipAssetId] = Fractionalization({
            ipAssetId: ipAssetId,
            totalSupply: totalSupply,
            pricePerFraction: pricePerFraction,
            creator: msg.sender,
            active: true,
            sold: 0
        });
        
        // Mark as fractionalized in registry
        ipAssetRegistry.markAsFractionalized(ipAssetId);
        
        emit IPFractionalized(ipAssetId, tokenId, totalSupply, msg.sender);
        
        return tokenId;
    }

    /**
     * @dev Purchase fractional tokens
     * @param ipAssetId The ID of the IP Asset
     * @param amount Number of fractions to purchase
     */
    function purchaseFractions(
        uint256 ipAssetId,
        uint256 amount
    ) external payable nonReentrant {
        Fractionalization storage frac = fractionalizations[ipAssetId];
        require(frac.active, "Fractionalization not active");
        require(frac.sold + amount <= frac.totalSupply, "Not enough fractions available");
        
        uint256 totalCost = frac.pricePerFraction * amount;
        require(msg.value >= totalCost, "Insufficient payment");
        
        uint256 tokenId = ipAssetToTokenId[ipAssetId];
        
        // Mint tokens to buyer
        _mint(msg.sender, tokenId, amount, "");
        
        frac.sold += amount;
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit FractionsPurchased(ipAssetId, msg.sender, amount, totalCost);
    }

    /**
     * @dev Get fractionalization details
     * @param ipAssetId The ID of the IP Asset
     */
    function getFractionalization(uint256 ipAssetId) external view returns (Fractionalization memory) {
        return fractionalizations[ipAssetId];
    }

    /**
     * @dev Get ownership percentage for an address
     * @param ipAssetId The ID of the IP Asset
     * @param owner The address to check
     */
    function getOwnershipPercentage(uint256 ipAssetId, address owner) external view returns (uint256) {
        Fractionalization memory frac = fractionalizations[ipAssetId];
        if (frac.totalSupply == 0) return 0;
        
        uint256 tokenId = ipAssetToTokenId[ipAssetId];
        uint256 balance = balanceOf(owner, tokenId);
        
        // Return percentage with 2 decimal precision (e.g., 500 = 5.00%)
        return (balance * 10000) / frac.totalSupply;
    }

    /**
     * @dev Get balance of fractions for an address
     * @param ipAssetId The ID of the IP Asset
     * @param owner The address to check
     */
    function getFractionBalance(uint256 ipAssetId, address owner) external view returns (uint256) {
        uint256 tokenId = ipAssetToTokenId[ipAssetId];
        return balanceOf(owner, tokenId);
    }

    /**
     * @dev Withdraw funds from fractionalization sales (for creator)
     * @param ipAssetId The ID of the IP Asset
     */
    function withdrawProceeds(uint256 ipAssetId) external nonReentrant {
        Fractionalization memory frac = fractionalizations[ipAssetId];
        require(frac.creator == msg.sender, "Only creator can withdraw");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        // In a real implementation, you might want to track proceeds per IP Asset
        payable(msg.sender).transfer(balance);
    }
}

