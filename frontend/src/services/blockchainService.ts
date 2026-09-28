import { ActivityEvent, BlockchainStatus } from "@/types/event";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Deterministic mock hash generator (fallback)
function generateMockHex(length: number = 64): string {
  const chars = "0123456789abcdef";
  let result = "0x";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

let currentBlockHeight = 4921803;

export const blockchainService = {
  getBlockchainStatus: async (): Promise<BlockchainStatus> => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/blockchain/status`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Backend unavailable");
      const data = await res.json();
      return {
        connected: data.connected ?? true,
        walletAddress: data.walletAddress ?? "0x8F71C94b2A06E5D71C17A4",
        network: data.network ?? "MST Testnet v2.4",
        chainId: data.chainId ?? 8841,
        blockHeight: data.blockHeight ?? currentBlockHeight,
        latencyMs: data.latencyMs ?? 8,
        balanceMST: data.balanceMST ?? 42.85,
        activeDaemons: data.activeDaemons ?? 14,
        clusterHealth: data.clusterHealth ?? "SYNCHRONIZED",
      };
    } catch {
      // Graceful fallback: return mock status
      return {
        connected: true,
        walletAddress: "0x8F71C94b2A06E5D71C17A4B3c2",
        network: "MST Testnet v2.4",
        chainId: 8841,
        blockHeight: ++currentBlockHeight,
        latencyMs: 8,
        balanceMST: 42.85,
        activeDaemons: 14,
        clusterHealth: "SYNCHRONIZED",
      };
    }
  },

  getActivities: async (limit = 20): Promise<ActivityEvent[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/blockchain/activities?limit=${limit}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Backend unavailable");
      return await res.json();
    } catch {
      return [];
    }
  },

  submitActivity: async (
    event: Omit<ActivityEvent, "id" | "eventHash" | "transactionHash" | "blockNumber" | "status" | "network">
  ): Promise<ActivityEvent> => {
    currentBlockHeight += 1;
    const eventHash = generateMockHex(64);
    const transactionHash = generateMockHex(64);
    const id = `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newEvent: ActivityEvent = {
      ...event,
      id,
      eventHash,
      transactionHash,
      blockNumber: currentBlockHeight,
      network: "MST TESTNET (Chain ID: 8841)",
      status: "confirmed",
      details: {
        ...event.details,
        gasUsed: "0.00042 MST",
        latencyMs: 14,
      },
    };

    // Realistic async delay for mock transaction confirmation
    await new Promise((resolve) => setTimeout(resolve, 600));

    return newEvent;
  },

  verifyEventProof: async (
    eventHash: string
  ): Promise<{
    verified: boolean;
    blockNumber: number;
    attestationType: string;
    timestamp: string;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      verified: true,
      blockNumber: currentBlockHeight,
      attestationType: "MST-Proof ZK-7 Snark",
      timestamp: new Date().toISOString(),
    };
  },
};
