import { Obstacle, RobotState } from "@/types/robot";

export interface CollisionCheckResult {
  hasCollision: boolean;
  collidedObstacleIds: string[];
  minClearance: number;
}

/**
 * Checks for collisions between robot circular footprint (radius r) and obstacles (rectangles)
 * Also checks distance to arena boundary walls.
 */
export function checkCollisions(
  robot: RobotState,
  obstacles: Obstacle[],
  arenaWidth: number,
  arenaHeight: number
): CollisionCheckResult {
  const robotRadius = Math.max(robot.width, robot.height) / 2;
  const collidedObstacleIds: string[] = [];
  let minClearance = 999.0;

  // 1. Boundary walls clearance
  const distToLeft = robot.x;
  const distToRight = arenaWidth - robot.x;
  const distToBottom = robot.y;
  const distToTop = arenaHeight - robot.y;

  const wallDistances = [
    distToLeft - robotRadius,
    distToRight - robotRadius,
    distToBottom - robotRadius,
    distToTop - robotRadius,
  ];

  for (const wd of wallDistances) {
    if (wd < minClearance) minClearance = Math.max(0, wd);
    if (wd <= 0) {
      collidedObstacleIds.push("boundary-wall");
    }
  }

  // 2. Obstacles collision & clearance
  for (const obs of obstacles) {
    // Find closest point on rectangle [obs.x, obs.x + obs.width] x [obs.y, obs.y + obs.height]
    const closestX = Math.max(obs.x, Math.min(robot.x, obs.x + obs.width));
    const closestY = Math.max(obs.y, Math.min(robot.y, obs.y + obs.height));

    const dx = robot.x - closestX;
    const dy = robot.y - closestY;
    const distanceSq = dx * dx + dy * dy;
    const distance = Math.sqrt(distanceSq);

    const clearance = distance - robotRadius;
    if (clearance < minClearance) {
      minClearance = Math.max(0, clearance);
    }

    if (distance <= robotRadius) {
      collidedObstacleIds.push(obs.id);
    }
  }

  return {
    hasCollision: collidedObstacleIds.length > 0,
    collidedObstacleIds,
    minClearance: Number(minClearance.toFixed(3)),
  };
}
