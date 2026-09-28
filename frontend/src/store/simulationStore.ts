import { SimulationStatus } from "@/types/simulation";
import { simulationEngine } from "@/simulation/engine";

export const simulationStore = {
  getStatus: (): SimulationStatus => simulationEngine.getStatus(),
  getSpeed: (): number => simulationEngine.getSpeed(),
};
