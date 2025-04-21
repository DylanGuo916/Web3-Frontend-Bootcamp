// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTMarket {
    struct Listing {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
    }

    IERC20 public paymentToken;
    uint256 public listingId;

    mapping(uint256 => Listing) public listings;

    event NFTListed(uint256 indexed id, address seller, address nft, uint256 tokenId, uint256 price);
    event NFTPurchased(uint256 indexed id, address buyer);

    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
    }

    function listNFT(address nft, uint256 tokenId, uint256 price) external {
        IERC721(nft).transferFrom(msg.sender, address(this), tokenId);
        listings[listingId] = Listing(msg.sender, nft, tokenId, price);
        emit NFTListed(listingId, msg.sender, nft, tokenId, price);
        listingId++;
    }

    function buyNFT(uint256 _id) external {
        Listing memory l = listings[_id];
        require(l.price > 0, "Invalid listing");

        paymentToken.transferFrom(msg.sender, l.seller, l.price);
        IERC721(l.nftAddress).transferFrom(address(this), msg.sender, l.tokenId);

        delete listings[_id];
        emit NFTPurchased(_id, msg.sender);
    }
}