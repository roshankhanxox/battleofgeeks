// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Quiz Token (QZT) Contract
contract QuizToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("QuizToken", "QZT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 1e18);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * 1e18);
    }
}
