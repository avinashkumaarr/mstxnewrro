// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IRobotRegistry {
    function isRobotActive(bytes32 robotId) external view returns (bool);
}

/**
 * @title RobotEventLedger
 * @dev Anchors hashes of robot events for verifiable integrity.
 */
contract RobotEventLedger is AccessControl {
    bytes32 public constant ANCHOR_ROLE = keccak256("ANCHOR_ROLE");

    IRobotRegistry public immutable registry;

    struct EventProof {
        bytes32 robotId;
        address submitter;
        uint256 blockTimestamp;
        bytes32 eventHash; // E.g., SHA-256 canonical hash from backend
    }

    mapping(bytes32 => EventProof) public eventProofs;

    event ProofAnchored(
        bytes32 indexed eventId,
        bytes32 indexed robotId,
        bytes32 eventHash,
        address submitter
    );

    error EventAlreadyAnchored();
    error EventNotAnchored();
    error RobotNotActive();
    error InvalidInput();

    constructor(address _registryAddress) {
        if (_registryAddress == address(0)) revert InvalidInput();
        registry = IRobotRegistry(_registryAddress);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ANCHOR_ROLE, msg.sender);
    }

    /**
     * @notice Anchors a hash representing a backend event.
     * @param eventId Unique bytes32 identifier of the event.
     * @param robotId ID of the associated robot.
     * @param eventHash The hash (e.g., SHA-256) of the canonical event JSON.
     */
    function anchorEvent(bytes32 eventId, bytes32 robotId, bytes32 eventHash) external onlyRole(ANCHOR_ROLE) {
        if (eventId == bytes32(0) || robotId == bytes32(0) || eventHash == bytes32(0)) {
            revert InvalidInput();
        }
        
        if (eventProofs[eventId].blockTimestamp != 0) {
            revert EventAlreadyAnchored();
        }

        if (!registry.isRobotActive(robotId)) {
            revert RobotNotActive();
        }

        eventProofs[eventId] = EventProof({
            robotId: robotId,
            submitter: msg.sender,
            blockTimestamp: block.timestamp,
            eventHash: eventHash
        });

        emit ProofAnchored(eventId, robotId, eventHash, msg.sender);
    }

    /**
     * @notice Retrieve an event proof.
     */
    function getEventProof(bytes32 eventId) external view returns (EventProof memory) {
        if (eventProofs[eventId].blockTimestamp == 0) revert EventNotAnchored();
        return eventProofs[eventId];
    }
}
