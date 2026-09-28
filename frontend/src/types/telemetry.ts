export interface TelemetryData {
  pose: {
    x: number;
    y: number;
    theta: number; // degrees for display
    thetaRad: number;
  };
  velocity: {
    linear: number;  // m/s
    angular: number; // rad/s
  };
  motion: {
    distanceTraveled: number; // meters
    goalDistance: number;     // meters
    executionTime: number;    // seconds
    collisions: number;
    waypointsCompleted: number;
    totalWaypoints: number;
  };
  lidar: {
    front: number;
    left: number;
    right: number;
    rear: number;
    channelCount: number;
    frequency: number;
  };
  system: {
    fps: number;
    latency: number;
    tickMs: number;
    status: "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED";
  };
}
