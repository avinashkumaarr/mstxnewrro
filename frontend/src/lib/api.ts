import { challengeService } from "@/services/challengeService";
import { simulationService } from "@/services/simulationService";
import { evaluationService } from "@/services/evaluationService";
import { activityService } from "@/services/activityService";
import { blockchainService } from "@/services/blockchainService";

/**
 * Unified API interface for frontend components.
 * Currently backed by mock services, ready for backend API replacement.
 */
export const api = {
  challenges: challengeService,
  simulation: simulationService,
  evaluation: evaluationService,
  activity: activityService,
  blockchain: blockchainService,
};

export default api;
