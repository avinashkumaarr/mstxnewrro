import { ActivityEvent, BlockchainStatus } from "@/types/event";

// Deterministic mock hash generator
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
    return Promise.resolve({
      connected: true,
      walletAddress: "0x8x71C94b2A06E5D71C17A4",
      network: "MST Testnet v2.4",
      chainId: 8841,
      blockHeight: currentBlockHeight,
      latencyMs: 8,
      balanceMST: 42.85,
      activeDaemons: 14,
      clusterHealth: "SYNCHRONIZED",
    });
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

  verifyEventProof: async (eventHash: string): Promise<{
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
