import { SimulationResult } from "@/types/simulation";

export interface EvaluationInput {
  waypointsReached: number;
  totalWaypoints: number;
  collisions: number;
  goalReached: boolean;
  executionTime: number;
  timeLimit: number;
  pathLength: number;
  idealPathLength: number;
  minClearanceRecorded: number;
  minClearanceThreshold: number;
}

export const evaluationService = {
  evaluateSimulation: async (input: EvaluationInput): Promise<SimulationResult> => {
    const {
      waypointsReached,
      totalWaypoints,
      collisions,
      goalReached,
      executionTime,
      timeLimit,
      pathLength,
      idealPathLength,
      minClearanceRecorded,
      minClearanceThreshold,
    } = input;

    // Path efficiency calculation (clamped 40% to 98%)
    const efficiencyRatio = idealPathLength > 0 && pathLength > 0
      ? Math.min(0.98, Math.max(0.4, idealPathLength / pathLength))
      : 0.85;
    const pathEfficiency = Math.round(efficiencyRatio * 100);

    // Dynamic score derivation
    let score = 0;

    // 1. Waypoint points (up to 45 pts)
    const waypointScore = totalWaypoints > 0 ? (waypointsReached / totalWaypoints) * 45 : 0;
    score += waypointScore;

    // 2. Goal completion (25 pts)
    if (goalReached) {
      score += 25;
    }

    // 3. Efficiency points (up to 15 pts)
    score += (pathEfficiency / 100) * 15;

    // 4. Time bonus (up to 15 pts)
    if (executionTime <= timeLimit) {
      const timeRemainingFraction = Math.max(0, (timeLimit - executionTime) / timeLimit);
      score += 10 + (timeRemainingFraction * 5);
    } else {
      score = Math.max(0, score - 15);
    }

    // 5. Collision penalty (-35 pts per collision)
    score -= collisions * 35;

    // Clamp score
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    // Rule checks
    const clearancePassed = minClearanceRecorded >= minClearanceThreshold;
    const zeroCollisionsPassed = collisions === 0;
    const timePassed = executionTime <= timeLimit;
    const isPassed = goalReached && zeroCollisionsPassed && finalScore >= 70;

    let failureReason: string | undefined = undefined;
    if (!zeroCollisionsPassed) {
      failureReason = `Zero collision tolerance breached (${collisions} collision${collisions > 1 ? "s" : ""} detected).`;
    } else if (!goalReached) {
      failureReason = "Robot did not reach Goal Zone within safe threshold.";
    } else if (!timePassed) {
      failureReason = `Time limit exceeded (${executionTime.toFixed(1)}s > ${timeLimit}s).`;
    } else if (finalScore < 70) {
      failureReason = `Overall performance score (${finalScore}/100) below required threshold (70/100).`;
    }

    const summaryMessage = isPassed
      ? `Mission Accomplished! Kinematics verified with ${finalScore}% efficiency and zero obstacle breaches.`
      : (failureReason || "Simulation failed evaluation criteria.");

    return Promise.resolve({
      completed: true,
      success: isPassed,
      score: finalScore,
      collisions,
      waypointsReached,
      totalWaypoints,
      executionTime: Number(executionTime.toFixed(2)),
      pathEfficiency,
      minClearanceRecorded: Number(minClearanceRecorded.toFixed(2)),
      status: isPassed ? "PASSED" : "FAILED",
      failureReason,
      summaryMessage,
    });
  },
};
