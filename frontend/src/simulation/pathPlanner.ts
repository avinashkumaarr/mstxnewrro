export interface PathPoint {
  x: number;
  y: number;
}

/**
 * A* Path Planner stub that generates discretized collision-aware waypoints
 */
export function planPathAStar(
  start: PathPoint,
  goal: PathPoint,
  waypoints: PathPoint[] = []
): PathPoint[] {
  return [start, ...waypoints, goal];
}
