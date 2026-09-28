import { Obstacle } from "@/types/robot";

export interface PathPoint {
  x: number;
  y: number;
}

export class AStarPlanner {
  private grid: boolean[][] = [];
  private cols: number;
  private rows: number;
  public resolution: number;

  constructor(arenaWidth: number, arenaHeight: number, resolution = 0.25) {
    this.resolution = resolution;
    this.cols = Math.ceil(arenaWidth / resolution);
    this.rows = Math.ceil(arenaHeight / resolution);
    this.grid = Array(this.cols).fill(false).map(() => Array(this.rows).fill(false));
  }

  public updateObstacles(obstacles: Obstacle[], robotRadius: number) {
    // Reset grid
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.grid[i][j] = false;
      }
    }

    // Mark obstacle cells
    const inflation = robotRadius + 0.15; // Safety margin
    for (const obs of obstacles) {
      const minX = Math.max(0, obs.x - inflation);
      const minY = Math.max(0, obs.y - inflation);
      const maxX = Math.min(this.cols * this.resolution, obs.x + obs.width + inflation);
      const maxY = Math.min(this.rows * this.resolution, obs.y + obs.height + inflation);

      const startCol = Math.floor(minX / this.resolution);
      const startRow = Math.floor(minY / this.resolution);
      const endCol = Math.floor(maxX / this.resolution);
      const endRow = Math.floor(maxY / this.resolution);

      for (let c = startCol; c <= endCol; c++) {
        for (let r = startRow; r <= endRow; r++) {
          if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
            this.grid[c][r] = true;
          }
        }
      }
    }
  }

  public findPath(start: PathPoint, goal: PathPoint): PathPoint[] {
    const startC = Math.floor(start.x / this.resolution);
    const startR = Math.floor(start.y / this.resolution);
    const goalC = Math.floor(goal.x / this.resolution);
    const goalR = Math.floor(goal.y / this.resolution);

    if (startC < 0 || startC >= this.cols || startR < 0 || startR >= this.rows) return [];
    if (goalC < 0 || goalC >= this.cols || goalR < 0 || goalR >= this.rows) return [];

    // Fast check if goal is blocked
    if (this.grid[goalC][goalR]) {
       // Find nearest unblocked cell to goal
       return [];
    }

    const openSet: any[] = [];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const startId = `${startC},${startR}`;
    const goalId = `${goalC},${goalR}`;

    openSet.push({ id: startId, c: startC, r: startR, f: 0 });
    gScore.set(startId, 0);

    const heuristic = (c1: number, r1: number, c2: number, r2: number) => Math.hypot(c1 - c2, r1 - r2);

    fScore.set(startId, heuristic(startC, startR, goalC, goalR));

    let iters = 0;
    while (openSet.length > 0 && iters < 5000) {
      iters++;
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();

      if (current.id === goalId) {
        const path: PathPoint[] = [];
        let currId = goalId;
        while (cameFrom.has(currId)) {
          const [cc, cr] = currId.split(",").map(Number);
          path.unshift({ x: cc * this.resolution + this.resolution/2, y: cr * this.resolution + this.resolution/2 });
          currId = cameFrom.get(currId)!;
        }
        return path;
      }

      closedSet.add(current.id);

      const neighbors = [
        [0, 1], [1, 0], [0, -1], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ];

      for (const [dc, dr] of neighbors) {
        const nc = current.c + dc;
        const nr = current.r + dr;
        
        if (nc < 0 || nc >= this.cols || nr < 0 || nr >= this.rows) continue;
        if (this.grid[nc][nr]) continue; // Obstacle

        const nId = `${nc},${nr}`;
        if (closedSet.has(nId)) continue;

        // Prevent diagonal tunneling through blocks
        if (dc !== 0 && dr !== 0) {
          if (this.grid[current.c + dc][current.r] || this.grid[current.c][current.r + dr]) {
            continue;
          }
        }

        const tentativeG = gScore.get(current.id)! + Math.hypot(dc, dr);
        
        if (!gScore.has(nId) || tentativeG < gScore.get(nId)!) {
          cameFrom.set(nId, current.id);
          gScore.set(nId, tentativeG);
          const f = tentativeG + heuristic(nc, nr, goalC, goalR);
          fScore.set(nId, f);
          
          if (!openSet.find(n => n.id === nId)) {
            openSet.push({ id: nId, c: nc, r: nr, f });
          }
        }
      }
    }

    return []; // No path
  }
}
