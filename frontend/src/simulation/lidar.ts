import { LidarRay, LidarScan, Obstacle, RobotState } from "@/types/robot";

/**
 * Intersects a 2D ray with an axis-aligned line segment
 */
function raySegmentIntersect(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number | null {
  const v1x = ox - x1;
  const v1y = oy - y1;
  const v2x = x2 - x1;
  const v2y = y2 - y1;
  const v3x = -dy;
  const v3y = dx;

  const dot = v2x * v3x + v2y * v3y;
  if (Math.abs(dot) < 0.000001) return null;

  const t1 = (v2x * v1y - v2y * v1x) / dot;
  const t2 = (v1x * v3x + v1y * v3y) / dot;

  if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
    return t1;
  }
  return null;
}

export function simulateLidarScan(
  robot: RobotState,
  obstacles: Obstacle[],
  arenaWidth: number,
  arenaHeight: number,
  numRays: number = 64,
  rangeMax: number = 14.0
): LidarScan {
  const rays: LidarRay[] = [];
  const rangeMin = 0.1;

  // Pre-collect all bounding segments (arena walls + obstacles)
  const segments: [number, number, number, number][] = [
    // Arena borders
    [0, 0, arenaWidth, 0],
    [arenaWidth, 0, arenaWidth, arenaHeight],
    [arenaWidth, arenaHeight, 0, arenaHeight],
    [0, arenaHeight, 0, 0],
  ];

  for (const obs of obstacles) {
    const x1 = obs.x;
    const y1 = obs.y;
    const x2 = obs.x + obs.width;
    const y2 = obs.y + obs.height;
    segments.push([x1, y1, x2, y1]);
    segments.push([x2, y1, x2, y2]);
    segments.push([x2, y2, x1, y2]);
    segments.push([x1, y2, x1, y1]);
  }

  for (let i = 0; i < numRays; i++) {
    const relAngle = (i / numRays) * (Math.PI * 2);
    const globalAngle = robot.theta + relAngle;
    const dirX = Math.cos(globalAngle);
    const dirY = Math.sin(globalAngle);

    let minT = rangeMax;
    let hit = false;

    for (const [sx1, sy1, sx2, sy2] of segments) {
      const t = raySegmentIntersect(robot.x, robot.y, dirX, dirY, sx1, sy1, sx2, sy2);
      if (t !== null && t >= rangeMin && t < minT) {
        minT = t;
        hit = true;
      }
    }

    rays.push({
      angle: relAngle,
      distance: Number(minT.toFixed(2)),
      hitX: robot.x + dirX * minT,
      hitY: robot.y + dirY * minT,
      hit,
    });
  }

  // Sample cardinal directions for telemetry
  // Front: 0 rad relative
  // Left: +PI/2 rad
  // Rear: PI rad
  // Right: -PI/2 rad (3PI/2)
  const getCardinalDistance = (targetRelAngle: number): number => {
    let closestRay = rays[0];
    let minDiff = 999;
    for (const ray of rays) {
      let diff = Math.abs(ray.angle - targetRelAngle);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff < minDiff) {
        minDiff = diff;
        closestRay = ray;
      }
    }
    return closestRay.distance;
  };

  const front = getCardinalDistance(0);
  const left = getCardinalDistance(Math.PI / 2);
  const rear = getCardinalDistance(Math.PI);
  const right = getCardinalDistance((3 * Math.PI) / 2);

  return {
    rays,
    frontDistance: Number(front.toFixed(2)),
    leftDistance: Number(left.toFixed(2)),
    rightDistance: Number(right.toFixed(2)),
    rearDistance: Number(rear.toFixed(2)),
    rangeMin,
    rangeMax,
    channelCount: numRays,
    frequency: 10,
  };
}
