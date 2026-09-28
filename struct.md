roboledger/
│
├── frontend/                       # Next.js + TypeScript + Three.js
│   ├── public/
│   │   ├── models/
│   │   │   └── robot.glb
│   │   ├── textures/
│   │   └── images/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── robots/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── simulation/
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   └── page.tsx
│   │   │   ├── maintenance/
│   │   │   │   └── page.tsx
│   │   │   ├── blockchain/
│   │   │   │   └── page.tsx
│   │   │   └── verify/
│   │   │       └── [eventId]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── RobotStatusCard.tsx
│   │   │   │   ├── TelemetryChart.tsx
│   │   │   │   └── RecentEvents.tsx
│   │   │   ├── simulation/
│   │   │   │   ├── SimulationCanvas.tsx
│   │   │   │   ├── RobotModel.tsx
│   │   │   │   ├── Warehouse.tsx
│   │   │   │   ├── Obstacle.tsx
│   │   │   │   ├── SimulationControls.tsx
│   │   │   │   ├── LiDARVisualization.tsx
│   │   │   │   └── SimulationTelemetry.tsx
│   │   │   ├── robots/
│   │   │   │   ├── RobotCard.tsx
│   │   │   │   └── RobotDetails.tsx
│   │   │   └── blockchain/
│   │   │       ├── WalletConnect.tsx
│   │   │       ├── TransactionStatus.tsx
│   │   │       └── VerificationResult.tsx
│   │   │
│   │   ├── simulation/
│   │   │   ├── engine.ts
│   │   │   ├── robotController.ts
│   │   │   ├── physics.ts
│   │   │   ├── collision.ts
│   │   │   ├── lidar.ts
│   │   │   ├── pathPlanner.ts
│   │   │   ├── waypointFollower.ts
│   │   │   └── telemetryGenerator.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useSimulation.ts
│   │   │   ├── useRobots.ts
│   │   │   └── useTelemetry.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── store/
│   │   │   ├── simulationStore.ts
│   │   │   └── robotStore.ts
│   │   │
│   │   └── types/
│   │       ├── robot.ts
│   │       ├── simulation.ts
│   │       ├── telemetry.ts
│   │       └── event.ts
│   │
│   ├── .env.example
│   ├── next.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── postcss.config.mjs
│
├── backend/                        # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── api/
│   │   │   ├── router.py
│   │   │   └── routes/
│   │   │       ├── health.py
│   │   │       ├── robots.py
│   │   │       ├── simulations.py
│   │   │       ├── telemetry.py
│   │   │       ├── events.py
│   │   │       ├── maintenance.py
│   │   │       └── blockchain.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── robot.py
│   │   │   ├── simulation.py
│   │   │   ├── telemetry.py
│   │   │   ├── robot_event.py
│   │   │   ├── maintenance.py
│   │   │   └── blockchain_record.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── robot.py
│   │   │   ├── simulation.py
│   │   │   ├── telemetry.py
│   │   │   ├── event.py
│   │   │   └── blockchain.py
│   │   │
│   │   ├── services/
│   │   │   ├── robot_service.py
│   │   │   ├── simulation_service.py
│   │   │   ├── telemetry_service.py
│   │   │   ├── event_service.py
│   │   │   ├── hash_service.py
│   │   │   └── blockchain_service.py
│   │   │
│   │   ├── db/
│   │   │   ├── session.py
│   │   │   ├── base.py
│   │   │   └── init_db.py
│   │   │
│   │   └── websocket/
│   │       └── simulation_socket.py
│   │
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── tests/
│   │   ├── test_robots.py
│   │   ├── test_simulations.py
│   │   ├── test_telemetry.py
│   │   ├── test_events.py
│   │   └── test_blockchain.py
│   │
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── web3/                           # Solidity + Hardhat + MST
│   ├── contracts/
│   │   ├── RobotRegistry.sol
│   │   └── RobotEventLedger.sol
│   │
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── verify.ts
│   │
│   ├── test/
│   │   ├── RobotRegistry.test.ts
│   │   └── RobotEventLedger.test.ts
│   │
│   ├── ignition/
│   │   └── modules/
│   │       └── RoboLedger.ts
│   │
│   ├── deployments/
│   │   └── mst-testnet.json
│   │
│   ├── hardhat.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-documentation.md
│   ├── smart-contracts.md
│   ├── mst-testnet-setup.md
│   └── deployment-guide.md
│
├── infra/
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── .gitignore
├── README.md
└── LICENSE