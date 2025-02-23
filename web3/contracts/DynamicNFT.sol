// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyToken is ERC721, ERC721URIStorage, Ownable {
    IERC20 public paymentToken; // ERC20 token used for payment
    uint256 public mintPrice; // Mint price in ERC20 tokens
    uint256 private _nextTokenId;

    constructor(
        address initialOwner,
        address _paymentToken,
        uint256 _mintPrice
    ) ERC721("MyToken", "MTK") Ownable(initialOwner) {
        paymentToken = IERC20(_paymentToken);
        mintPrice = _mintPrice;
    }

    function safeMint(address to, string memory uri) public returns (uint256) {
        require(
            paymentToken.transferFrom(msg.sender, address(this), mintPrice),
            "Payment failed"
        );

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    function evolve() public {
        require(balanceOf(msg.sender) > 0, "Must own an NFT");
        require(
            paymentToken.transferFrom(msg.sender, address(this), 50e18),
            "Insufficient ERC20 tokens (must send at least 50)"
        );
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
