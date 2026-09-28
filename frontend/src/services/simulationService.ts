import { Challenge } from "@/types/challenge";
import { SimulationResult, SimulationStatus } from "@/types/simulation";
import { TelemetryData } from "@/types/telemetry";
import { simulationEngine, SimulationEngineListener } from "@/simulation/engine";

export interface SimulationInput {
  code: string;
  challenge: Challenge;
  speed?: number;
}

export const simulationService = {
  loadChallenge: async (challenge: Challenge): Promise<void> => {
    simulationEngine.loadChallenge(challenge);
    return Promise.resolve();
  },

  runSimulation: async (input: SimulationInput): Promise<void> => {
    if (input.speed) {
      simulationEngine.setSpeed(input.speed);
    }
    simulationEngine.run(input.code);
    return Promise.resolve();
  },

  stopSimulation: async (): Promise<void> => {
    simulationEngine.stop();
    return Promise.resolve();
  },

  resetSimulation: async (): Promise<void> => {
    simulationEngine.reset();
    return Promise.resolve();
  },

  setSpeed: async (speed: number): Promise<void> => {
    simulationEngine.setSpeed(speed);
    return Promise.resolve();
  },

  getTelemetry: async (): Promise<TelemetryData> => {
    return Promise.resolve(simulationEngine.getTelemetry());
  },

  getStatus: async (): Promise<SimulationStatus> => {
    return Promise.resolve(simulationEngine.getStatus());
  },

  subscribe: (listener: SimulationEngineListener) => {
    return simulationEngine.addListener(listener);
  },
};
