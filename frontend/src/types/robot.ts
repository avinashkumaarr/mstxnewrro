export interface RobotState {
  x: number;          // World coordinate in meters
  y: number;          // World coordinate in meters
  theta: number;      // Heading angle in radians
  linearVelocity: number;   // m/s
  angularVelocity: number;  // rad/s
  width: number;
  height: number;
}

export interface LidarRay {
  angle: number;      // Relative angle in radians
  distance: number;   // Distance to obstacle/wall in meters
  hitX: number;       // World intersection X
  hitY: number;       // World intersection Y
  hit: boolean;
}

export interface LidarScan {
  rays: LidarRay[];
  frontDistance: number;
  leftDistance: number;
  rightDistance: number;
  rearDistance: number;
  rangeMin: number;
  rangeMax: number;
  channelCount: number;
  frequency: number; // Hz
}

export interface Obstacle {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isDynamic?: boolean;
  velocity?: { vx: number; vy: number };
  minBound?: number;
  maxBound?: number;
  colliding?: boolean;
}

export interface Waypoint {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  cost: number;
  reached: boolean;
  isGoal?: boolean;
}
