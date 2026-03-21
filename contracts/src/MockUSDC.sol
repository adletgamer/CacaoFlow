// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC
/// @notice Free-mint ERC20 for Avalanche Fuji demo.
///         Any address can call faucet() to receive tokens.
contract MockUSDC is ERC20, Ownable {
    uint8 private constant _DECIMALS = 6;
    uint256 public constant FAUCET_AMOUNT = 10_000 * 10 ** 6; // 10,000 USDC

    constructor() ERC20("Mock USD Coin", "mUSDC") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** _DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /// @notice Anyone can mint 10,000 mUSDC for testing
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice Owner can mint arbitrary amount to any address
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
