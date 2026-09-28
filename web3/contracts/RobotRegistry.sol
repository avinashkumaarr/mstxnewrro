// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RobotRegistry
 * @dev Manages the registration and state of virtual robots.
 */
contract RobotRegistry is Ownable {
    
    struct Robot {
        address owner;
        uint256 registeredAt;
        bool isActive;
        string metadataURI;
    }

    mapping(bytes32 => Robot) public robots;

    event RobotRegistered(bytes32 indexed robotId, address indexed owner, string metadataURI);
    event RobotMetadataUpdated(bytes32 indexed robotId, string newMetadataURI);
    event RobotStatusChanged(bytes32 indexed robotId, bool isActive);

    error RobotAlreadyRegistered();
    error RobotNotRegistered();
    error NotRobotOwnerOrAdmin();

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a new robot.
     * @param robotId Unique bytes32 identifier (e.g., from backend UUID).
     * @param metadataURI URI to off-chain metadata.
     */
    function registerRobot(bytes32 robotId, string calldata metadataURI) external {
        if (robots[robotId].registeredAt != 0) {
            revert RobotAlreadyRegistered();
        }

        robots[robotId] = Robot({
            owner: msg.sender,
            registeredAt: block.timestamp,
            isActive: true,
            metadataURI: metadataURI
        });

        emit RobotRegistered(robotId, msg.sender, metadataURI);
    }

    /**
     * @notice Update a robot's metadata.
     * @param robotId The robot's ID.
     * @param metadataURI The new metadata URI.
     */
    function updateMetadata(bytes32 robotId, string calldata metadataURI) external {
        _checkAccess(robotId);
        
        robots[robotId].metadataURI = metadataURI;
        emit RobotMetadataUpdated(robotId, metadataURI);
    }

    /**
     * @notice Toggle a robot's active status.
     * @param robotId The robot's ID.
     * @param isActive New active status.
     */
    function setRobotStatus(bytes32 robotId, bool isActive) external {
        _checkAccess(robotId);
        
        robots[robotId].isActive = isActive;
        emit RobotStatusChanged(robotId, isActive);
    }

    /**
     * @notice Check if a robot exists and is active.
     */
    function isRobotActive(bytes32 robotId) external view returns (bool) {
        return robots[robotId].registeredAt != 0 && robots[robotId].isActive;
    }

    /**
     * @dev Internal function to check if caller is owner or admin.
     */
    function _checkAccess(bytes32 robotId) internal view {
        if (robots[robotId].registeredAt == 0) revert RobotNotRegistered();
        if (msg.sender != owner() && msg.sender != robots[robotId].owner) {
            revert NotRobotOwnerOrAdmin();
        }
    }
}
