You are a senior Solidity and Web3 engineer. Build the complete Web3 module for RoboLedger, a blockchain-integrated 3D robotics simulation platform for a hackathon.

PROJECT OVERVIEW
RoboLedger is a virtual robotics platform. Robots operate in a simulated warehouse, move along paths, detect obstacles, generate telemetry, and complete tasks. The backend stores detailed simulation data in PostgreSQL. The blockchain stores immutable proofs of important robot events, allowing users to verify that event records have not been altered.

The blockchain is used for robot event integrity, not certificates. Do not store continuous robot movement or sensor telemetry on-chain.

GOAL
Implement a working Solidity smart contract system using Hardhat and TypeScript, with deployment and verification scripts for MST Testnet. Make the module integrate cleanly with the existing Next.js frontend and FastAPI backend.

TECH STACK
- Solidity (use a stable compiler version compatible with MST EVM; configure explicitly)
- Hardhat with TypeScript
- ethers.js v6
- OpenZeppelin contracts where appropriate
- Mocha/Chai or the testing setup supported by the selected Hardhat version
- MST Testnet
- dotenv for local environment configuration

FIRST: INSPECT THE REPOSITORY
Inspect the existing web3/ directory and repository root before editing. Preserve existing code and avoid overwriting useful files. Confirm the installed Node and Hardhat versions. Use compatible dependencies and commands. Do not modify frontend or backend files unless necessary, and explain any required integration changes.

PROJECT STRUCTURE
Create or complete:
web3/
  contracts/
    RobotRegistry.sol
    RobotEventLedger.sol
  scripts/
    deploy.ts
    verify.ts
    read-event.ts
  test/
    RobotRegistry.test.ts
    RobotEventLedger.test.ts
  ignition/
    modules/
      RoboLedger.ts
  deployments/
    mst-testnet.json
  hardhat.config.ts
  package.json
  tsconfig.json
  .env.example
  .gitignore
  README.md

SMART CONTRACT 1: ROBOT REGISTRY
Implement a RobotRegistry contract to register and manage virtual robot identities.

Requirements:
- Register a robot using a unique bytes32 robot identifier.
- Store owner wallet address, registration timestamp, active status, and optional metadata URI or metadata hash.
- Allow the robot owner or an authorized administrator to update permitted metadata and deactivate/reactivate a robot.
- Prevent duplicate registrations.
- Include events for registration, metadata updates, and status changes.
- Provide view functions to retrieve robot details and check whether a robot is registered and active.
- Use role-based access control or a simple ownership model with clearly defined permissions.
- Avoid storing large metadata strings on-chain.
- Prevent unauthorized users from modifying another user's robot.

SMART CONTRACT 2: ROBOT EVENT LEDGER
Implement a RobotEventLedger contract to anchor important robot event hashes.

Requirements:
- Accept a unique event identifier and a bytes32 event hash.
- Associate each event with a robot ID, submitter, block timestamp, and transaction.
- Support event types such as task completion, collision, maintenance, software update, and robot registration.
- Ensure the referenced robot is registered and active when required, using RobotRegistry.
- Prevent duplicate event IDs and prevent accidental overwriting of anchored hashes.
- Emit a detailed event when a proof is anchored.
- Provide view functions to retrieve a proof by event ID and check whether an event ID exists.
- Store only hashes and compact metadata on-chain. Full event JSON and telemetry remain in PostgreSQL.
- Use clear custom errors and events.
- Restrict anchoring to authorized submitters or role holders, with an explicit and documented authorization model.
- Keep the contract simple enough to explain and demonstrate during the hackathon.

EVENT HASH FORMAT
Define and document a canonical event hashing scheme shared with the backend:
- Use a deterministic serialization format for event fields.
- Include the event ID, robot ID, event type, event timestamp, and canonical payload hash as applicable.
- Use keccak256 for Solidity-side identifiers or EVM commitments where appropriate, but clearly distinguish it from backend SHA-256 hashes.
- Do not silently convert one hash algorithm into another.
- The backend is responsible for producing a stable event hash; the contract stores the supplied bytes32 commitment.
- Include test vectors or examples demonstrating how the backend and frontend should pass bytes32 hashes.
- Do not claim Solidity can independently validate a SHA-256 hash of arbitrary JSON unless the full canonical input is provided and the contract explicitly computes it.

CONTRACT SECURITY
- Use checks-effects-interactions where applicable.
- Use OpenZeppelin access control or ownership utilities where they fit.
- Prevent unauthorized writes, duplicate records, and invalid robot references.
- Avoid reentrancy-prone external calls; use immutable registry references where appropriate.
- Validate zero addresses and invalid identifiers.
- Emit events for state changes.
- Do not include private keys, wallet secrets, or hardcoded credentials in source code.
- Explain the threat model and limitations: blockchain anchoring proves that a particular hash was committed, not that the original event was truthful.

MST TESTNET CONFIGURATION
- Configure a named mstTestnet network in Hardhat.
- Read the RPC URL, chain ID, deployer private key, and explorer URL from environment variables.
- Never invent the MST chain ID, RPC URL, or explorer URL. If unavailable, use clearly marked placeholders in .env.example and explain how to obtain the real values from official organizer documentation.
- Ensure configuration fails with a clear message if required deployment settings are missing.
- Do not print or expose private keys in logs.
- Support local Hardhat network for development and tests without any real wallet or testnet tokens.
- Document using the organizer-recommended Bridgekey wallet and MST Testnet faucet. Do not request or store the user's seed phrase.

DEPLOYMENT
- Implement a deployment script that deploys RobotRegistry first, then RobotEventLedger with the registry address.
- Print deployed addresses and network details.
- Save a deployment manifest to deployments/mst-testnet.json containing network name, chain ID, contract addresses, deployer address, deployment transaction hashes, and deployment timestamp.
- Do not overwrite a deployment manifest for a different network without warning.
- Include a post-deployment smoke test that reads contract state and verifies the registry and ledger are connected correctly.
- Add a verification script that can compare local artifacts and deployed code where the network supports it.
- If explorer verification is unavailable, document the limitation instead of claiming verification succeeded.

BACKEND INTEGRATION
The FastAPI backend is responsible for creating and storing robot events, generating canonical event hashes, coordinating anchoring, persisting transaction hashes and confirmation status, and verifying the event hash against the recomputed hash and on-chain proof.

The Web3 module must provide:
- A clear contract ABI and address manifest for backend/frontend integration.
- A documented function to anchor a proof.
- A documented read function to retrieve a proof and verify event existence.
- A documented role setup procedure for the backend signer or authorized wallet.
- An example ethers.js integration.
- A clear distinction between submitted, pending, confirmed, and failed transactions.

FRONTEND INTEGRATION
The Next.js frontend may connect through the user's Bridgekey wallet if it supports the required EVM provider interface. Keep wallet signing separate from backend database operations.
Provide a small TypeScript example using ethers.js v6 for connecting to the wallet, checking chain ID, switching networks only when supported and correctly configured, reading robot registration, reading an anchored event proof, and displaying transaction status after anchoring if the connected account is authorized.
Do not assume Bridgekey exposes a particular provider API without checking its documentation. Keep integration adaptable to an EIP-1193-compatible provider.

TESTING
Write comprehensive local tests for:
RobotRegistry:
- Successful registration.
- Duplicate registration rejection.
- Metadata updates by authorized users.
- Unauthorized metadata update rejection.
- Deactivation and reactivation.
- Invalid zero identifiers and addresses.
- Correct event emission.

RobotEventLedger:
- Successful event anchoring.
- Duplicate event ID rejection.
- Unauthorized anchoring rejection.
- Unregistered or inactive robot rejection.
- Correct event retrieval.
- Correct event fields and event emission.
- Zero hash and invalid identifier handling.
- Registry integration and permission setup.
- Access-control edge cases.

Run all tests on the local Hardhat network and fix failures. Tests must not require MST Testnet access or real funds.

QUALITY AND DOCUMENTATION
- Use readable, well-commented Solidity code.
- Follow Solidity style conventions.
- Use NatSpec documentation for public contract functions.
- Add meaningful custom errors.
- Keep contract storage efficient.
- Explain contract roles, deployment order, event data format, security assumptions, and gas-cost considerations.
- Provide exact commands for installation, compilation, testing, local deployment, and MST Testnet deployment.
- Include example environment configuration using placeholders only.
- Include a README with architecture, contract interfaces, deployment steps, and troubleshooting.

IMPLEMENTATION PROCESS
1. Inspect the repository and existing web3 files.
2. Present a concise plan.
3. Implement the contracts and Hardhat configuration.
4. Compile the contracts and fix all errors.
5. Write and run tests; fix failures.
6. Implement deployment and read/verification scripts.
7. Document the real MST Testnet configuration requirements.
8. Provide integration examples for FastAPI and Next.js.
9. Finish with a summary of created files, commands to run, test results, deployed addresses if deployment actually occurred, and any remaining blockers.

IMPORTANT RULES
- Do not fabricate MST network details or claim a deployment occurred unless it actually did.
- Do not use real funds or ask for a seed phrase.
- Do not store telemetry on-chain.
- Do not make up an ABI or deployed address for an existing external contract.
- Do not stop after creating a plan or generating pseudocode. Create working files and run local tests.
- Do not delete existing project code.

ACCEPTANCE CRITERIA
- Contracts compile successfully.
- All local unit tests pass.
- Robot registration and event anchoring work on the local Hardhat network.
- Unauthorized operations are rejected.
- Deployment scripts deploy contracts in the correct order and save a manifest.
- Backend and frontend integration examples use the actual generated ABI and deployment manifest.
- MST Testnet deployment works once valid official network settings and test tokens are configured.
- Documentation accurately explains what blockchain verification proves and what it does not.

Start by inspecting the existing web3/ directory and then implement the module end to end.