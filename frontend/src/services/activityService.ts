import { ActivityEvent, ActivityEventType } from "@/types/event";
import { blockchainService } from "./blockchainService";

const INITIAL_EVENTS: ActivityEvent[] = [
  {
    id: "act-101",
    type: "CHALLENGE_PASSED",
    challengeId: "challenge-07",
    challengeTitle: "Dynamic Obstacle Avoidance & Waypoint Navigation",
    timestamp: "20:42:15",
    eventHash: "0x7f9a882e9d246c10b7f832a89cb1f58921df4a889b71a0429f521b34882131b8",
    transactionHash: "0x3a921f0b72189cd188402f1a4e5122189d21c900e5271829019b84172a1531b8",
    blockNumber: 4921800,
    network: "MST TESTNET (Chain ID: 8841)",
    status: "confirmed",
    details: {
      score: 99.4,
      executionTime: 21.4,
      collisions: 0,
      waypointsCompleted: "4/4",
      gasUsed: "0.00038 MST",
      latencyMs: 18,
      message: "Attestation verified: Zero collision tolerance satisfied.",
    },
  },
  {
    id: "act-102",
    type: "SIMULATION_COMPLETED",
    challengeId: "challenge-07",
    challengeTitle: "Dynamic Obstacle Avoidance & Waypoint Navigation",
    timestamp: "20:38:50",
    eventHash: "0x89d21c900e5271829019b84172a1531b87f9a882e9d246c10b7f832a89cb1f58",
    transactionHash: "0x4b78912ca87192a54b981290ffad12093418290231920acb91823901bcdae219",
    blockNumber: 4921798,
    network: "MST TESTNET (Chain ID: 8841)",
    status: "confirmed",
    details: {
      score: 94.0,
      executionTime: 22.8,
      collisions: 0,
      waypointsCompleted: "4/4",
      gasUsed: "0.00041 MST",
      latencyMs: 14,
    },
  },
  {
    id: "act-103",
    type: "CODE_SUBMITTED",
    challengeId: "challenge-07",
    challengeTitle: "Dynamic Obstacle Avoidance & Waypoint Navigation",
    timestamp: "20:34:10",
    eventHash: "0x1b4908ef981203498acbd1204910924719280374198270192384701293847102",
    transactionHash: "0x981203498acbd12049109247192803741982701923847012938471021b4908ef",
    blockNumber: 4921795,
    network: "MST TESTNET (Chain ID: 8841)",
    status: "confirmed",
    details: {
      codeHash: "0x9c31401fba29",
      gasUsed: "0.00021 MST",
      latencyMs: 11,
    },
  },
  {
    id: "act-104",
    type: "CHALLENGE_STARTED",
    challengeId: "challenge-07",
    challengeTitle: "Dynamic Obstacle Avoidance & Waypoint Navigation",
    timestamp: "20:28:02",
    eventHash: "0x203498acbd12049109247192803741982701923847012938471021b4908ef981",
    transactionHash: "0xacbd12049109247192803741982701923847012938471021b4908ef981203498",
    blockNumber: 4921790,
    network: "MST TESTNET (Chain ID: 8841)",
    status: "confirmed",
    details: {
      gasUsed: "0.00015 MST",
      latencyMs: 9,
    },
  },
];

let activityStorage = [...INITIAL_EVENTS];
const listeners: ((events: ActivityEvent[]) => void)[] = [];

export const activityService = {
  getActivityHistory: async (): Promise<ActivityEvent[]> => {
    return Promise.resolve([...activityStorage]);
  },

  getActivity: async (id: string): Promise<ActivityEvent | null> => {
    const item = activityStorage.find((e) => e.id === id);
    return Promise.resolve(item ? { ...item } : null);
  },

  recordActivity: async (
    type: ActivityEventType,
    challengeId: string,
    challengeTitle?: string,
    details?: ActivityEvent["details"]
  ): Promise<ActivityEvent> => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const submitted = await blockchainService.submitActivity({
      type,
      challengeId,
      challengeTitle: challengeTitle || "Robotics Simulation Track",
      timestamp: timeStr,
      details,
    });

    activityStorage = [submitted, ...activityStorage];
    listeners.forEach((cb) => cb([...activityStorage]));
    return submitted;
  },

  subscribe: (callback: (events: ActivityEvent[]) => void) => {
    listeners.push(callback);
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },
};
