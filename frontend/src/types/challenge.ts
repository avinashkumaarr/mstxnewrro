import { Obstacle, Waypoint } from "./robot";
import { SimulationConfig } from "./simulation";

export interface Challenge {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  objective: string;
  track: "Navigation & Odometry" | "Obstacle Avoidance" | "Path Planning" | "Python ROS2" | "SLAM & Mapping";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  xp: number;
  rewardBadge?: string;
  environment: string;
  robotType: string;
  minClearance: number;
  timeLimit: number; // seconds
  evaluationRules: {
    id: string;
    description: string;
    checked: boolean;
  }[];
  arenaConfig: SimulationConfig;
  initialRobotPose: {
    x: number;
    y: number;
    theta: number;
  };
  waypoints: Waypoint[];
  obstacles: Obstacle[];
  target: {
    x: number;
    y: number;
  };
  starterCode: string;
}
