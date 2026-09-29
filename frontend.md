# RoboLab Chain — Frontend Architecture Specification

## Overview

The RoboLab Chain frontend is built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. It provides:
1. **Interactive 2D/3D Robotics Simulation**: Canvas-based AGV kinematics, dynamic obstacles, and simulated LiDAR raycasting.
2. **Robotics Challenges**: Multi-tier obstacle courses and waypoint navigation evaluation.
3. **Decentralized Certificate Management**: Upload, inspect, share, and anchor educational certificates and brand identity assets.
4. **On-Chain Attestation via BridgeKey**: Native Web3 wallet integration with the MST Testnet (Chain ID `91562037`).
5. **Instant Client-Side Verification**: Web Crypto API SHA-256 fingerprinting and on-chain verification report portal (`/verify`).

---

## Technical Stack

- **Framework**: Next.js 14.2.35 (App Router)
- **Language**: TypeScript 5.9+
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Web3 Interface**: Custom EIP-1193 provider client (`mstBlockchain.ts`) with BridgeKey priority
- **Cryptography**: Web Crypto API (`crypto.subtle`) for in-browser SHA-256 calculation (<50ms)
- **Authentication**: Optional Clerk integration with graceful Keyless mode support

---

## Directory Structure

```text
frontend/
├── public/
│   └── models/               # 3D assets (GLB)
├── src/
│   ├── app/
│   │   ├── api/              # Internal Next.js API route proxies
│   │   │   ├── certificates/ # Registry, upload & OCR endpoints
│   │   │   └── rpc/          # MST RPC proxy endpoint
│   │   ├── blockchain/       # Blockchain explorer & status view
│   │   ├── certificates/     # Certificate management & registration
│   │   ├── challenges/       # Robotics challenge playground
│   │   ├── dashboard/        # Central monitoring overview
│   │   ├── evaluation/       # Automated code/trajectory evaluation
│   │   ├── events/           # Simulation event logs & hashes
│   │   ├── robots/           # AGV fleet management
│   │   ├── simulation/       # Fullscreen robotics sandbox
│   │   └── verify/           # Document verification portal
│   ├── components/           # Reusable UI modules & modals
│   ├── lib/                  # Web3 client, crypto, and local store
│   ├── services/             # REST & API service abstractions
│   └── types/                # TypeScript interface definitions
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Key Modules

- `mstBlockchain.ts`: Provides wallet detection, chain-switching (`0x5748805`), balance query, and on-chain calldata anchoring via `eth_sendTransaction`.
- `crypto.ts`: High-performance browser-side hashing returning standard `0x<hex>` 32-byte hashes.
- `certificateService.ts`: Unified service handling document analysis, AI anomaly checks, blockchain verification queries, and registry persistence.
