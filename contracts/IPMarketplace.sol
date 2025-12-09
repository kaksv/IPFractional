// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./IPFractionalizer.sol";

/**
 * @title IPMarketplace
 * @dev Secondary marketplace for trading fractional IP tokens
 */

// The Contract address of the Deployed Contract on the Aeneid Testnet is 0x0433A8e6f1b6B9B9d3013A136653D0b47d1397b6
contract IPMarketplace is Ownable, ReentrancyGuard {
    IPFractionalizer public ipFractionalizer;
    
    struct Listing {
        uint256 listingId;
        uint256 ipAssetId;
        uint256 tokenId;
        address seller;
        uint256 amount;
        uint256 pricePerToken; // In wei
        bool active;
        uint256 createdAt;
    }
    
    // Mapping from listing ID to listing
    mapping(uint256 => Listing) public listings;
    
    // Mapping from IP Asset ID to listing IDs
    mapping(uint256 => uint256[]) public ipAssetListings;
    
    // Next listing ID
    uint256 private _nextListingId = 1;
    
    // Marketplace fee (in basis points, e.g., 250 = 2.5%)
    uint256 public marketplaceFee = 250; // 2.5%
    
    // Events
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed ipAssetId,
        address indexed seller,
        uint256 amount,
        uint256 pricePerToken
    );
    
    event ListingCancelled(uint256 indexed listingId);
    
    event FractionsSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPaid
    );

    constructor(address _ipFractionalizer) Ownable(msg.sender) {
        ipFractionalizer = IPFractionalizer(_ipFractionalizer);
    }

    /**
     * @dev Create a listing to sell fractional tokens
     * @param ipAssetId The ID of the IP Asset
     * @param amount Number of fractions to sell
     * @param pricePerToken Price per fraction in wei
     */
    function createListing(
        uint256 ipAssetId,
        uint256 amount,
        uint256 pricePerToken
    ) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(pricePerToken > 0, "Price must be greater than 0");
        
        uint256 tokenId = ipFractionalizer.ipAssetToTokenId(ipAssetId);
        require(tokenId != 0, "IP Asset not fractionalized");
        
        // Transfer tokens from seller to marketplace
        IERC1155(address(ipFractionalizer)).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            amount,
            ""
        );
        
        uint256 listingId = _nextListingId++;
        
        listings[listingId] = Listing({
            listingId: listingId,
            ipAssetId: ipAssetId,
            tokenId: tokenId,
            seller: msg.sender,
            amount: amount,
            pricePerToken: pricePerToken,
            active: true,
            createdAt: block.timestamp
        });
        
        ipAssetListings[ipAssetId].push(listingId);
        
        emit ListingCreated(listingId, ipAssetId, msg.sender, amount, pricePerToken);
        
        return listingId;
    }

    /**
     * @dev Purchase fractions from a listing
     * @param listingId The ID of the listing
     * @param amount Number of fractions to purchase
     */
    function purchaseFromListing(
        uint256 listingId,
        uint256 amount
    ) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= listing.amount, "Insufficient tokens in listing");
        
        uint256 totalCost = listing.pricePerToken * amount;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Calculate fees
        uint256 fee = (totalCost * marketplaceFee) / 10000;
        uint256 sellerProceeds = totalCost - fee;
        
        // Transfer tokens to buyer
        IERC1155(address(ipFractionalizer)).safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId,
            amount,
            ""
        );
        
        // Update listing
        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.active = false;
        }
        
        // Transfer payment to seller
        payable(listing.seller).transfer(sellerProceeds);
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit FractionsSold(listingId, msg.sender, amount, totalCost);
    }

    /**
     * @dev Cancel a listing
     * @param listingId The ID of the listing
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Only seller can cancel");
        require(listing.active, "Listing not active");
        
        // Return tokens to seller
        IERC1155(address(ipFractionalizer)).safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId,
            listing.amount,
            ""
        );
        
        listing.active = false;
        
        emit ListingCancelled(listingId);
    }

    /**
     * @dev Get all listings for an IP Asset
     * @param ipAssetId The ID of the IP Asset
     */
    function getIPAssetListings(uint256 ipAssetId) external view returns (uint256[] memory) {
        return ipAssetListings[ipAssetId];
    }

    /**
     * @dev Get listing details
     * @param listingId The ID of the listing
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /**
     * @dev Set marketplace fee (only owner)
     * @param newFee New fee in basis points
     */
    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = newFee;
    }

    /**
     * @dev Withdraw marketplace fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

