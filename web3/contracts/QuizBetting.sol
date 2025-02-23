// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract QuizBetting is Ownable, ReentrancyGuard {
    IERC20 public quizToken;
    
    // Struct to store bet information for each genre
    struct GenrePool {
        uint256 totalPool;
        mapping(address => uint256) bets;
        bool isActive;
    }
    
    // Mapping from genre to betting pool
    mapping(string => GenrePool) public genrePools;
    
    // Events
    event BetPlaced(address indexed player, string genre, uint256 amount);
    event BetFinalized(address indexed player, string genre, string result, uint256 reward);
    event GenreCreated(string genre);
    
    constructor(address _quizToken) Ownable(msg.sender) {
        quizToken = IERC20(_quizToken);
    }
    
    // Create a new genre pool
    function createGenre(string memory genre) public onlyOwner {
        require(!genrePools[genre].isActive, "Genre already exists");
        genrePools[genre].isActive = true;
        emit GenreCreated(genre);
    }
    
    // Place a bet for a specific genre
    function placeBet(uint256 amount, string memory genre) public nonReentrant {
        require(genrePools[genre].isActive, "Genre does not exist");
        require(amount > 0, "Bet amount must be greater than 0");
        require(genrePools[genre].bets[msg.sender] == 0, "Already placed a bet for this genre");
        
        // Transfer tokens from player to contract
        require(quizToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update genre pool
        genrePools[genre].bets[msg.sender] = amount;
        genrePools[genre].totalPool += amount;
        
        emit BetPlaced(msg.sender, genre, amount);
    }
    
    // Finalize bet and distribute rewards
    function finalizeBet(
    address player,
    string memory genre,
    string memory result
    ) public onlyOwner nonReentrant {
        require(genrePools[genre].isActive, "Genre does not exist");
        require(genrePools[genre].bets[player] > 0, "No bet placed");

        uint256 betAmount = genrePools[genre].bets[player];
        uint256 reward = 0;

        if (keccak256(bytes(result)) == keccak256(bytes("success"))) {
            // 80% of the losing pool goes to winner
            uint256 losingPool = genrePools[genre].totalPool - betAmount;
            reward = betAmount + (losingPool * 5 / 100);
            genrePools[genre].totalPool -= reward; // Deduct reward from pool
        } else if (keccak256(bytes(result)) == keccak256(bytes("tie"))) {
            // Return original bet amount
            reward = betAmount;
            genrePools[genre].totalPool -= betAmount; // Refund, so we deduct from pool
        } 
        // If "failure", do nothing—bet stays in contract

        genrePools[genre].bets[player] = 0; // Reset player's bet

        // Transfer reward if applicable
        if (reward > 0) {
            require(quizToken.transfer(player, reward), "Reward transfer failed");
        }

        emit BetFinalized(player, genre, result, reward);
    }

        
    
    // Get total pool amount for a genre
    function getTotalPool(string memory genre) public view returns (uint256) {
        require(genrePools[genre].isActive, "Genre does not exist");
        return genrePools[genre].totalPool;
    }
    
    // Get player's bet amount for a genre
    function getPlayerBet(address player, string memory genre) public view returns (uint256) {
        require(genrePools[genre].isActive, "Genre does not exist");
        return genrePools[genre].bets[player];
    }
    
    // Emergency withdrawal function for contract owner
    function emergencyWithdraw() public onlyOwner {
        uint256 balance = quizToken.balanceOf(address(this));
        require(quizToken.transfer(owner(), balance), "Emergency withdrawal failed");
    }
}