import { RobotState, Obstacle, Waypoint, LidarScan } from "./robot";
import { TelemetryData } from "./telemetry";

export type SimulationStatus = "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED";

export interface SimulationConfig {
  arenaWidth: number;   // meters (e.g. 24m)
  arenaHeight: number;  // meters (e.g. 16m)
  timeLimit: number;    // seconds (e.g. 45 or 60s)
  minClearance: number; // meters (e.g. 0.35m)
  maxLinearSpeed: number; // m/s
  presetName: string;
  obstacleDensity: "LOW" | "MEDIUM" | "HIGH";
  noiseModel: string;
}

export interface SimulationResult {
  completed: boolean;
  success: boolean;
  score: number;             // 0 - 100 derived dynamic score
  collisions: number;
  waypointsReached: number;
  totalWaypoints: number;
  executionTime: number;     // seconds
  pathEfficiency: number;    // percentage
  minClearanceRecorded: number;
  status: "PASSED" | "FAILED";
  failureReason?: string;
  summaryMessage: string;
}

export interface SimulationSnapshot {
  timestamp: number;
  robot: RobotState;
  obstacles: Obstacle[];
  waypoints: Waypoint[];
  lidar: LidarScan;
  telemetry: TelemetryData;
}
