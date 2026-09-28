export type ActivityEventType =
  | "CHALLENGE_STARTED"
  | "CODE_SUBMITTED"
  | "SIMULATION_STARTED"
  | "SIMULATION_COMPLETED"
  | "CHALLENGE_PASSED"
  | "CHALLENGE_FAILED";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  challengeId: string;
  challengeTitle?: string;
  timestamp: string;
  eventHash: string;
  transactionHash?: string;
  blockNumber?: number;
  network: string;
  status: "pending" | "confirmed" | "failed";
  details?: {
    score?: number;
    executionTime?: number;
    collisions?: number;
    waypointsCompleted?: string;
    gasUsed?: string;
    latencyMs?: number;
    codeHash?: string;
    message?: string;
  };
}

export interface BlockchainStatus {
  connected: boolean;
  walletAddress: string;
  network: string;
  chainId: number;
  blockHeight: number;
  latencyMs: number;
  balanceMST: number;
  activeDaemons: number;
  clusterHealth: "SYNCHRONIZED" | "SYNCING" | "DEGRADED";
}
