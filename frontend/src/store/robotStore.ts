import { RobotState } from "@/types/robot";
import { simulationEngine } from "@/simulation/engine";

export const robotStore = {
  getRobotState: (): RobotState => simulationEngine.getRobot(),
};
