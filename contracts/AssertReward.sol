// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AssetToken is ERC20 {
    uint256 public assetPerToken = 1; // number of assets created per token deposit
    uint256 public rewardPerAsset = 0.1 ether; // amount of reward per asset per day
    uint256 public rewardPool = 10000 ether; // total reward pool size

    struct Asset {
        uint256 createdAt;
        uint256 lastClaimedAt;
    }

    mapping(address => Asset[]) public assets;

    event Deposit(address indexed from, uint256 value);
    event AssetCreated(address indexed from, uint256 count);
    event RewardClaimed(address indexed from, uint256 count);

    constructor() ERC20("Asset Token", "ASSET") {}

    function deposit(uint256 value) external {
        require(value % 10 == 0, "Value must be multiple of 10");
        _mint(msg.sender, value);
        emit Deposit(msg.sender, value);

        uint256 assetCount = value / 10;
        for (uint256 i = 0; i < assetCount; i++) {
            assets[msg.sender].push(Asset(block.timestamp, block.timestamp));
        }
        emit AssetCreated(msg.sender, assetCount);
    }

    function claimRewards(uint256 startIndex, uint256 endIndex) external {
        uint256 totalReward = 0;
        require(startIndex < endIndex, "Invalid index range");

        for (uint256 i = startIndex; i < endIndex; i++) {
            Asset storage asset = assets[msg.sender][i];
            require(asset.createdAt > 0, "Asset does not exist");

            uint256 rewardableDays = (block.timestamp - asset.lastClaimedAt) / 1 days;
            if (rewardableDays > 0) {
                uint256 reward = rewardableDays * rewardPerAsset;
                if (reward > rewardPool) {
                    reward = rewardPool;
                    rewardPool = 0;
                } else {
                    rewardPool -= reward;
                }
                totalReward += reward;
                asset.lastClaimedAt += rewardableDays * 1 days;
            }
        }

        require(totalReward > 0, "No rewards to claim");
        _mint(msg.sender, totalReward);
        emit RewardClaimed(msg.sender, totalReward);
    }
}
