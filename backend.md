You are a senior backend engineer and software architect. Build the complete, production-minded backend for RoboLedger, a blockchain-integrated 3D robotics simulation platform for a hackathon.

PROJECT CONTEXT
RoboLedger lets users manage virtual robots in a simulated warehouse. Robots move through the environment, follow paths, encounter obstacles, generate simulated LiDAR readings and telemetry, and complete tasks. The backend stores robot data, simulation sessions, telemetry, task events, maintenance records, and blockchain transaction proofs. Important events are hashed with SHA-256 and anchored to the MST Testnet blockchain. Detailed telemetry stays in PostgreSQL; do not store every sensor reading on-chain.

TECH STACK
- Python 3.11+
- FastAPI
- PostgreSQL
- SQLAlchemy 2.x async ORM
- Alembic migrations
- Pydantic v2 and pydantic-settings
- asyncpg
- JWT authentication with secure password hashing
- WebSockets for live simulation updates
- pytest and HTTPX for tests
- Docker and Docker Compose
- MST Testnet smart contract integration through a configurable JSON-RPC endpoint and contract address

REPOSITORY
Create the backend inside the existing `backend/` directory. Do not modify or delete the frontend or web3 folders. Inspect the existing repository before making changes. Preserve existing work and report any assumptions.

ARCHITECTURE
Use a clean, modular structure:
backend/
  app/
    main.py
    core/ (config, security, exceptions, logging)
    api/ (router and versioned routes)
    db/ (session, base, dependencies)
    models/
    schemas/
    repositories/
    services/
    websocket/
    utils/
  alembic/
  tests/
  requirements.txt
  .env.example
  Dockerfile
  docker-compose.yml
  alembic.ini
  README.md

FUNCTIONAL REQUIREMENTS
1. Authentication and users
- Register, login, retrieve current user, and logout/token invalidation if implemented.
- Hash passwords securely; never store plaintext passwords.
- Use JWT access tokens and configurable expiry.
- Protect private endpoints and validate ownership of resources.

2. Robot management
- Create, list, retrieve, update, and delete robots.
- Store robot name, type/model, description, status, battery percentage, position, orientation, capabilities, metadata, owner, and timestamps.
- Validate battery and coordinate ranges where applicable.
- Support robot status values such as idle, running, paused, offline, and maintenance.

3. Simulation management
- Create, list, retrieve, start, pause, resume, stop, and delete simulation sessions.
- Store robot, warehouse/environment configuration, initial pose, goal, status, start/end times, and summary.
- Validate state transitions and prevent invalid operations.
- The browser runs the 3D simulation. The backend coordinates sessions and persists state; do not pretend it runs a physics engine.

4. Telemetry
- Accept telemetry batches from the frontend, including timestamp, robot ID, position, orientation, velocity, battery, sensor readings, and simulation ID.
- Validate payloads and enforce batch size limits.
- Persist telemetry efficiently and provide time-range and pagination filters.
- Provide latest telemetry and summary endpoints.
- Do not put continuous telemetry on blockchain.

5. Robot events
- Record events such as task_started, task_completed, collision, obstacle_detected, low_battery, maintenance, robot_registered, and software_updated.
- Include event ID, robot, simulation, type, timestamp, payload, and integrity fields.
- Generate a deterministic canonical representation of event data and calculate a SHA-256 hash server-side.
- Prevent clients from submitting arbitrary trusted hashes. Clearly distinguish event creation time, hash creation time, and blockchain anchoring time.
- Support event history, filters, pagination, and event detail retrieval.

6. Blockchain anchoring and verification
- Design a provider abstraction for MST Testnet so the backend can work even before RPC and contract details are configured.
- Store chain ID, contract address, transaction hash, block number, event hash, status, and timestamps in a blockchain records table.
- Implement endpoints to request anchoring of an eligible event, inspect transaction status, and verify an event.
- Verify by recomputing the event hash from the stored canonical event and comparing it with the recorded hash and, when available, the on-chain value.
- Never claim an event is on-chain or verified until the RPC/contract confirms it.
- Handle pending, confirmed, failed, and unavailable states.
- Make anchoring idempotent to avoid duplicate submissions.
- Do not hardcode private keys, RPC URLs, chain IDs, or contract addresses. Prefer a backend signer only if securely configured; otherwise support a transaction-submission flow compatible with frontend wallet signing.
- Add clear TODO/configuration notes where the exact MST contract ABI or RPC details are not available. Do not invent them.

7. Maintenance
- Create and manage maintenance records, including robot, issue, description, status, scheduled time, completion time, and notes.
- Support maintenance history and status updates.
- Emit a corresponding robot event when maintenance is completed.

8. Dashboard and analytics
- Provide dashboard summary endpoints for robot counts by status, active simulations, recent events, completed tasks, collision counts, and blockchain anchoring statuses.
- Support date filters and ensure aggregate queries are efficient.
- Return empty states cleanly when there is no data.

9. WebSockets
- Provide authenticated WebSocket connections for simulation updates.
- Support telemetry updates, robot status changes, simulation state changes, and event notifications.
- Use a connection manager with room/group support by simulation ID.
- Validate authorization before joining a simulation room.
- Handle disconnects and malformed messages safely.
- Document the message format and provide a simple frontend integration example.

10. API design
- Use `/api/v1` for application endpoints and `/health` for health checks.
- Use consistent response schemas, HTTP status codes, pagination, filtering, and error responses.
- Generate OpenAPI documentation through FastAPI.
- Configure CORS using environment variables for the Next.js frontend.
- Add request validation and sensible request size limits.

DATABASE
Create SQLAlchemy models and Alembic migrations for users, robots, simulation sessions, telemetry records, robot events, maintenance records, and blockchain records. Use UUID primary keys, foreign keys, indexes, unique constraints where appropriate, timezone-aware timestamps, and cascade behavior deliberately. Avoid storing redundant data unless justified. Add indexes for common robot, simulation, event type, and time-range queries.

SECURITY AND RELIABILITY
- Use environment-based configuration and provide `.env.example` with safe placeholders only.
- Never commit secrets or expose them in API responses or logs.
- Validate resource ownership on every relevant endpoint.
- Add rate limiting where practical and document any external infrastructure needed.
- Add structured logging, centralized exception handling, database transaction boundaries, and graceful shutdown.
- Avoid insecure wildcard CORS in production.
- Do not trust client-provided event hashes, user IDs, or blockchain confirmation claims.

TESTING
Write meaningful tests for registration/login, authorization, robot CRUD, simulation state transitions, telemetry ingestion and filtering, event hashing, event verification, maintenance, dashboard aggregates, and WebSocket authorization. Use a test database or dependency overrides. Include tests for invalid input, missing resources, and unauthorized access. Mock blockchain RPC interactions; do not require real testnet funds for unit tests.

DEVELOPER EXPERIENCE
- Provide exact macOS setup commands using a Python virtual environment.
- Include PostgreSQL setup instructions and Docker Compose option.
- Include commands for installing dependencies, creating migrations, applying migrations, starting the API, running tests, and generating a development admin/user if appropriate.
- Add a complete README with architecture, environment variables, API endpoint examples, sample curl commands, and frontend integration notes.
- Provide a `.gitignore` suitable for Python, virtual environments, caches, secrets, and test artifacts.

IMPLEMENTATION PROCESS
1. Inspect the existing repository and current backend files before editing.
2. Give a short implementation plan.
3. Implement the backend in coherent stages, creating real working files rather than merely describing them.
4. After each stage, run relevant tests or static checks and fix errors.
5. Ensure imports, routers, schemas, models, and migrations are connected correctly.
6. Do not leave core endpoints as TODOs or placeholder implementations. For unavailable MST network/contract details, implement a clean adapter and clearly document the remaining configuration.
7. Do not overwrite existing files without inspecting them first.
8. Finish by reporting files created, features implemented, commands to run, test results, and any genuine blockers.

ACCEPTANCE CRITERIA
- The API starts locally with documented commands.
- Database migrations apply successfully to a clean PostgreSQL database.
- The OpenAPI docs load.
- Core endpoints work and enforce authentication/ownership.
- Simulation sessions and telemetry persist correctly.
- Event hashes are deterministic and independently verifiable.
- Blockchain status is reported honestly and gracefully handles missing configuration.
- Tests pass without needing a live blockchain.
- The backend is ready for integration with the existing Next.js frontend and the separately maintained Solidity contracts.

Start by inspecting the repository and then implement the backend. Do not stop after generating a plan.